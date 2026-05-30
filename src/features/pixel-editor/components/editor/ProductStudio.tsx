"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, X, Upload } from "lucide-react";
import { useEditor } from "@pixel/contexts/EditorContext";
import { resolveProductAssetUrl } from "@pixel/lib/productCustomization";
import { Button } from "@pixel/components/ui/button";
import { cn } from "@pixel/lib/utils";
import { countWords, enforceMaxWords, fitSingleLineTextInZone, toSingleLineText } from "@pixel/lib/textAdaptiveSizing";
import { fitObjectInZone } from "@pixel/lib/canvasZoneFit";
import { toast } from "sonner";
import { EditorCanvas } from "./EditorCanvas";
import { FabricImage, Rect } from "fabric";
import { getImageUrl } from "@/lib/imageUtils";
import { getPublicApiUrl } from "@/lib/env";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Fonts list matching the screenshot
const AVAILABLE_FONTS = [
  "Poppins",
  "Britney",
  "Playfair",
  "Dancing",
  "Anton",
  "Cinzel",
  "Allura",
  "Arial",
];

const DEFAULT_COLORS = [
  "#000000",
  "#1e293b",
  "#b91c1c",
  "#15803d",
  "#1d4ed8",
  "#d97706",
  "#6b21a8",
  "#ec4899",
];

export const ProductStudio: React.FC = () => {
  const {
    canvas,
    editorProduct,
    selectedVariantId,
    styleVariantsForPicker,
    selectedStyleVariantId,
    setSelectedStyleVariantId,
    editableZones,
    activeEditableZoneId,
    setActiveEditableZoneId,
    pushHistory,
  } = useEditor();

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fetchedFonts, setFetchedFonts] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [presetImages, setPresetImages] = useState<any[]>([]);

  const [hasUserUploadedLogo, setHasUserUploadedLogo] = useState(false);

  useEffect(() => {
    if (!canvas) return;
    const checkUserUpload = () => {
      const hasUpload = canvas.getObjects().some((o) => (o as any).isUserUploaded);
      setHasUserUploadedLogo(hasUpload);
    };

    checkUserUpload();

    canvas.on("after:render", checkUserUpload);

    return () => {
      canvas.off("after:render", checkUserUpload);
    };
  }, [canvas]);

  // Fetch fonts and media from backend
  useEffect(() => {
    const base = getPublicApiUrl();

    // Fetch Fonts
    fetch(`${base}/fonts`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFetchedFonts(data);
          data.forEach((font) => {
            const isLoaded = Array.from(document.fonts).some((f) => f.family === font.name);
            if (!isLoaded && font.url) {
              const fontUrl = getImageUrl(font.url);
              const fontFace = new FontFace(font.name, `url(${fontUrl})`);
              fontFace.load().then((loadedFace) => {
                document.fonts.add(loadedFace);
              }).catch((err) => console.error("Failed to load font", font.name, err));
            }
          });
        }
      })
      .catch((err) => console.error("Error fetching fonts", err));

    // Fetch Preset Images (admin-managed image library)
    fetch(`${base}/preset-images`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPresetImages(data.filter((img) => img.isActive !== false));
        }
      })
      .catch((err) => console.error("Error fetching preset images", err));

    // Fetch Media Gallery Images
    fetch(`${base}/public/media?limit=50`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const items = json?.data || json?.media || [];
        if (Array.isArray(items)) {
          setGalleryImages(items.filter((m) => m.type === "IMAGE" || m.url));
        }
      })
      .catch((err) => console.error("Error fetching gallery images", err));
  }, []);

  // Set first zone active by default if none selected
  useEffect(() => {
    if (editableZones.length > 0 && !activeEditableZoneId) {
      setActiveEditableZoneId(editableZones[0].id);
    }
  }, [editableZones, activeEditableZoneId, setActiveEditableZoneId]);

  const activeZone = editableZones.find((z) => z.id === activeEditableZoneId) ?? editableZones[0];

  const getDisplayFonts = (allowedFonts?: string[]) => {
    const hasAllField = allowedFonts && allowedFonts.some((f) => f.toLowerCase() === "all");
    if (allowedFonts && allowedFonts.length > 0 && !hasAllField) {
      return allowedFonts;
    }

    const customNames = fetchedFonts.map((f) => f.name);

    // Extract all fonts used in the fields/zones of this product customization
    const usedFonts = new Set<string>();
    
    // Look at root customization editableAreas
    editorProduct?.customization?.editableAreas?.forEach((area) => {
      if (area.fontFamily) usedFonts.add(area.fontFamily);
      area.textFields?.forEach((tf) => {
        if (tf.fontFamily) usedFonts.add(tf.fontFamily);
      });
    });

    // Look at styleVariants in customization
    editorProduct?.customization?.styleVariants?.forEach((sv) => {
      sv.editableAreas?.forEach((area) => {
        if (area.fontFamily) usedFonts.add(area.fontFamily);
        area.textFields?.forEach((tf) => {
          if (tf.fontFamily) usedFonts.add(tf.fontFamily);
        });
      });
    });

    // Look at variants in customization (if any)
    if (editorProduct?.customization?.variants) {
      Object.values(editorProduct.customization.variants).forEach((v: any) => {
        v.editableAreas?.forEach((area: any) => {
          if (area.fontFamily) usedFonts.add(area.fontFamily);
          area.textFields?.forEach((tf: any) => {
            if (tf.fontFamily) usedFonts.add(tf.fontFamily);
          });
        });
      });
    }

    return Array.from(new Set([...customNames, ...Array.from(usedFonts)]));
  };

  const getDisplayColors = (allowedColors?: string[]) => {
    const hasAll = allowedColors && allowedColors.some((c) => c.toLowerCase() === "all");
    if (allowedColors && allowedColors.length > 0 && !hasAll) {
      return allowedColors;
    }
    return DEFAULT_COLORS;
  };

  // Helper to find canvas Textbox by textFieldId or zoneId
  const getTextFieldBounds = (textFieldId?: string) => {
    if (!activeZone) return null;
    if (textFieldId && activeZone.textFields?.length) {
      const tf = activeZone.textFields.find((f) => f.id === textFieldId);
      if (tf) {
        return { x: tf.x, y: tf.y, width: tf.width, height: tf.height };
      }
    }
    return {
      x: activeZone.x,
      y: activeZone.y,
      width: activeZone.width,
      height: activeZone.height,
    };
  };

  const fitTextInField = (tb: any, textFieldId?: string, maxFontSize?: number) => {
    const bounds = getTextFieldBounds(textFieldId);
    if (!bounds) return;
    const cap = maxFontSize ?? tb.zoneMaxFontSize ?? tb.fontSize ?? 24;
    fitSingleLineTextInZone(tb, { width: bounds.width, height: bounds.height }, cap);
    fitObjectInZone(tb, { ...bounds, bleed: 0 });
  };

  const getTextboxForField = (textFieldId?: string, zoneId?: string) => {
    if (!canvas) return null;
    const objects = canvas.getObjects();
    return objects.find((obj) => {
      if (obj.type !== "textbox") return false;
      if (textFieldId) {
        return (obj as any).textFieldId === textFieldId;
      }
      if (zoneId) {
        return (obj as any).editableZoneId === zoneId && !(obj as any).textFieldId;
      }
      return false;
    }) as any;
  };

  const handleTextChange = (textVal: string, textFieldId?: string, zoneId?: string) => {
    const tb = getTextboxForField(textFieldId, zoneId);
    if (!tb) return;

    let newText = toSingleLineText(textVal || "");
    let maxLen = undefined;
    let maxWds = undefined;

    if (textFieldId && activeZone?.textFields) {
      const tf = activeZone.textFields.find((f) => f.id === textFieldId);
      if (tf) {
        maxLen = tf.maxLength;
        maxWds = tf.maxWords;
      }
    } else if (activeZone) {
      maxLen = activeZone.maxLength;
      maxWds = activeZone.maxWords;
    }

    if (maxLen && newText.length > maxLen) {
      newText = newText.substring(0, maxLen);
      toast.warning(`Maximum ${maxLen} characters allowed`);
    }

    if (maxWds) {
      const limited = enforceMaxWords(newText, maxWds);
      if (limited !== newText) {
        toast.warning(`Maximum ${maxWds} words allowed`);
      }
      newText = limited;
    }

    tb.set("text", newText.trim() ? newText : " ");
    fitTextInField(tb, textFieldId);
    tb.fire("changed");
    canvas?.requestRenderAll();
    pushHistory();
  };

  const handleFontChange = (fontVal: string, textFieldId?: string, zoneId?: string) => {
    const tb = getTextboxForField(textFieldId, zoneId);
    if (tb) {
      tb.set("fontFamily", fontVal);
      fitTextInField(tb, textFieldId);
      tb.fire("changed");
      canvas?.requestRenderAll();
      pushHistory();
    }
  };

  const handleFontSizeChange = (sizeVal: number, textFieldId?: string, zoneId?: string) => {
    const tb = getTextboxForField(textFieldId, zoneId);
    if (tb) {
      tb.zoneMaxFontSize = sizeVal;
      tb.set("fontSize", sizeVal);
      fitTextInField(tb, textFieldId, sizeVal);
      tb.fire("changed");
      canvas?.requestRenderAll();
      pushHistory();
    }
  };

  const handleColorChange = (colorVal: string, textFieldId?: string, zoneId?: string) => {
    const tb = getTextboxForField(textFieldId, zoneId);
    if (tb) {
      tb.set("fill", colorVal);
      canvas?.requestRenderAll();
      pushHistory();
    }
  };

  const handleReset = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (!(obj as any).isBackground) {
        canvas.remove(obj);
      }
    });
    canvas.discardActiveObject();
    canvas.renderAll();
    toast.success("Canvas reset to default");
  };

  const handleCheckout = () => {
    if (!canvas) {
      toast.error("Editor canvas is not ready yet.");
      return;
    }

    const toastId = toast.loading("Capturing your design details...");

    try {
      // Capture canvas dataURL
      const previewImage = canvas.toDataURL({
        format: 'png',
        quality: 0.95,
        multiplier: 1.5, // 1.5x resolution for good detail download
      });

      // Gather customization inputs from canvas objects
      const textInputs: any[] = [];
      const imageInputs: any[] = [];

      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        if ((obj as any).isBackground) return;

        // Custom properties are preserved in Fabric.js objects on canvas
        const isTextbox = obj.type === 'textbox' || obj.type === 'i-text';
        if (isTextbox || (obj as any).textFieldId) {
          textInputs.push({
            zoneId: (obj as any).editableZoneId || null,
            textFieldId: (obj as any).textFieldId || null,
            text: (obj as any).text || '',
            fontFamily: (obj as any).fontFamily || 'Arial',
            textColor: (obj as any).fill || '#000000',
          });
        } else if (obj.type === 'image' || (obj as any).editableZoneId) {
          imageInputs.push({
            zoneId: (obj as any).editableZoneId || null,
            imageUrl: (obj as any).src || (obj as any)._element?.src || '',
          });
        }
      });

      // Save checkout product payload into localStorage
      const checkoutPayload = {
        productId: editorProduct?.id,
        name: editorProduct?.name,
        slug: editorProduct?.slug,
        price: grandTotal,
        basePrice: basePrice,
        addonsTotal: addonsTotal + logoCharge,
        quantity: 1,
        image: editorProduct?.customization?.baseImage || '',
        previewImage,
        selectedVariantId,
        selectedStyleVariantId,
        customizationData: {
          selectedVariantId,
          selectedStyleVariantId,
          textInputs,
          imageInputs,
          previewImage,
        },
        isCustomized: true,
      };

      localStorage.setItem("checkout_item", JSON.stringify(checkoutPayload));

      toast.success("Design confirmed! Redirecting to checkout...", { id: toastId });

      // Check if user is logged in
      const storedUser = localStorage.getItem("user");
      setTimeout(() => {
        if (storedUser) {
          router.push("/checkout?mode=direct");
        } else {
          router.push("/login?redirect=/checkout?mode=direct");
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      toast.error("Failed to capture design details: " + err.message, { id: toastId });
    }
  };

  // Image upload handling for image zone
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas || !activeZone) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.src = event.target?.result as string;
      imgObj.onload = () => {
        // Remove existing image in this zone if any
        const existing = canvas.getObjects().find((o) => (o as any).editableZoneId === activeZone.id);
        if (existing) canvas.remove(existing);

        const scale = Math.min(activeZone.width / imgObj.width, activeZone.height / imgObj.height);
        const fabImg = new FabricImage(imgObj, {
          left: activeZone.x + (activeZone.width - imgObj.width * scale) / 2,
          top: activeZone.y + (activeZone.height - imgObj.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
          clipPath: new Rect({
            left: activeZone.x,
            top: activeZone.y,
            width: activeZone.width,
            height: activeZone.height,
            absolutePositioned: true,
          }),
        });
        fabImg.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
        });
        (fabImg as any).editableZoneId = activeZone.id;
        (fabImg as any).isUserUploaded = true;
        canvas.add(fabImg);
        canvas.setActiveObject(fabImg);
        canvas.requestRenderAll();
        pushHistory();
        toast.success("Image added to canvas");
      };
    };
    reader.readAsDataURL(file);
  };

  // Preset logo helper
  const addPresetImage = (url: string, label: string) => {
    if (!canvas || !activeZone) return;
    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous";
    imgObj.src = getImageUrl(url);
    imgObj.onload = () => {
      const existing = canvas.getObjects().find((o) => (o as any).editableZoneId === activeZone.id);
      if (existing) canvas.remove(existing);

      const scale = Math.min(activeZone.width / imgObj.width, activeZone.height / imgObj.height);
      const fabImg = new FabricImage(imgObj, {
        left: activeZone.x + (activeZone.width - imgObj.width * scale) / 2,
        top: activeZone.y + (activeZone.height - imgObj.height * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        clipPath: new Rect({
          left: activeZone.x,
          top: activeZone.y,
          width: activeZone.width,
          height: activeZone.height,
          absolutePositioned: true,
        }),
      });
      fabImg.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
      });
      (fabImg as any).editableZoneId = activeZone.id;
      canvas.add(fabImg);
      canvas.setActiveObject(fabImg);
      canvas.requestRenderAll();
      pushHistory();
      toast.success(`${label} added to canvas`);
    };
  };

  const clearZoneImage = () => {
    if (!canvas || !activeZone) return;
    const existing = canvas.getObjects().find((o) => (o as any).editableZoneId === activeZone.id);
    if (existing) {
      canvas.remove(existing);
      canvas.requestRenderAll();
      pushHistory();
      toast.success("Zone cleared");
    }
  };

  // Pricing calculations — use product base price from catalog (not a fixed amount)
  const basePrice = Number(editorProduct?.basePrice ?? editorProduct?.price ?? 0) || 0;
  const logoUploadPrice = editorProduct?.customization?.logoUploadPrice ?? 0;
  const logoCharge = hasUserUploadedLogo ? Number(logoUploadPrice) : 0;
  const activeStyle = styleVariantsForPicker.find((s) => s.id === selectedStyleVariantId);
  const addonsTotal = activeStyle ? Number(activeStyle.priceAddon || 0) : 0;
  const grandTotal = basePrice + addonsTotal + logoCharge;

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-900 flex flex-col font-sans pb-12 selection:bg-blue-500 selection:text-white">
      {/* Hidden file input for image upload */}
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm transition-all"
          title="Reset Canvas"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Epic Studio
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/shop")}
          className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm transition-all"
          title="Exit Studio"
        >
          <X className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 w-full mx-auto px-0 sm:px-6 pt-6 space-y-8 animate-fade-in">
        {/* Premium Addons Section */}
        {styleVariantsForPicker.length > 0 && (
          <section className="space-y-3 px-0 sm:px-0">
            <h2 className="text-center text-base font-bold tracking-wide text-slate-900 uppercase">
              Premium Addons
            </h2>
            <div className="w-full max-w-4xl mx-auto px-1 py-2">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView={3}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                loop={styleVariantsForPicker.length > 3}
                breakpoints={{
                  320: { slidesPerView: 3, spaceBetween: 10 },
                  640: { slidesPerView: 4, spaceBetween: 16 },
                  1024: { slidesPerView: 5, spaceBetween: 16 },
                }}
                className="pb-2 pt-1 px-1"
              >
                {styleVariantsForPicker.map((s) => {
                  const isActive = selectedStyleVariantId === s.id;
                  const mockup = resolveProductAssetUrl(s.baseImage);
                  return (
                    <SwiperSlide key={s.id}>
                      <button
                        onClick={() => setSelectedStyleVariantId(s.id)}
                        className={cn(
                          "w-full rounded-md border-2 p-0 text-left transition-all duration-300 flex flex-col bg-white shadow-sm hover:shadow-md cursor-pointer group",
                          isActive
                            ? "border-pink-500 ring-4 ring-pink-500/10 bg-pink-50/20"
                            : "border-slate-200/80 hover:border-slate-300"
                        )}
                      >
                        <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-slate-100  group-hover:scale-[1.02] transition-transform duration-300">
                          <img src={mockup} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0 p-2.5">
                          <div className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                            {s.title || "Option"}
                          </div>
                          <div className="text-[11px] font-extrabold text-pink-600 mt-1">
                            {s.priceAddon > 0 ? `+ ₹${Number(s.priceAddon).toFixed(2)}` : "Included"}
                          </div>
                        </div>
                      </button>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
            {/* Subtle divider bar */}
            <div className="w-32 h-1 bg-slate-200 mx-auto rounded-full mt-2" />
          </section>
        )}



        {/* Zone Tabs */}
        {editableZones.length > 0 && (
          <div className="w-full mb-4 md:mb-6 max-w-4xl mx-auto px-1 py-1">
            <Swiper
              spaceBetween={12}
              slidesPerView="auto"
              className="py-1 px-1"
            >
              {editableZones.map((z) => {
                const isActive = activeEditableZoneId === z.id;
                const isImg = z.type === "image";
                const typeZones = editableZones.filter(x => x.type === z.type);
                const indexInType = typeZones.findIndex(x => x.id === z.id);
                const num = indexInType !== -1 ? indexInType + 1 : 1;
                const label = z.label || (isImg ? `Image ${num}` : `Text ${num}`);

                return (
                  <SwiperSlide key={z.id} className="w-auto">
                    <button
                      onClick={() => setActiveEditableZoneId(z.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-md text-xs w-fit text-nowrap font-extrabold transition-all duration-300 border-2 shadow-sm cursor-pointer uppercase tracking-wider active:scale-95 block",
                        isImg
                          ? isActive
                            ? "bg-[#a3e635] border-[#a3e635] text-slate-900 shadow-[#a3e635]/20 shadow-md"
                            : "bg-white border-[#a3e635] text-[#65a30d] hover:bg-[#a3e635]/10"
                          : isActive
                            ? "bg-[#2b99ff] border-[#2b99ff] text-white shadow-[#2b99ff]/20 shadow-md"
                            : "bg-white border-[#2b99ff] text-[#2b99ff] hover:bg-[#2b99ff]/10"
                      )}
                    >
                      {label}
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}


        <div className="max-w-7xl m-auto grid lg:flex items-start w-full justify-center gap-10">
          {/* Creative Canvas Section */}
          <section className="space-y-3 flex-1 lg:sticky lg:top-24">
            <h2 className="hidden sm:block text-center text-base font-bold tracking-wide text-slate-900 uppercase">
              Creative Canvas
            </h2>
            <div className="relative sm:border-2 sm:border-slate-200/80 sm:rounded-3xl overflow-hidden bg-white sm:shadow-xl sm:shadow-slate-200/50 aspect-[4/3] w-full max-w-2xl mx-auto flex flex-col group">
              {/* Floating Zone Badges over canvas */}
              <div className="absolute top-4 left-4 z-20 hidden sm:flex flex-wrap gap-2 pointer-events-none">
                {editableZones.map((z) => {
                  const isImg = z.type === "image";
                  const typeZones = editableZones.filter(x => x.type === z.type);
                  const indexInType = typeZones.findIndex(x => x.id === z.id);
                  const num = indexInType !== -1 ? indexInType + 1 : 1;
                  return (
                    <span
                      key={z.id}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-md backdrop-blur-md transition-all duration-300 uppercase border",
                        isImg
                          ? "bg-[#a3e635]/90 text-slate-900 border-[#84cc16]"
                          : "bg-[#2b99ff]/90 text-white border-[#007aff]"
                      )}
                    >
                      {z.label || (isImg ? `Image ${num}` : `Text ${num}`)}
                    </span>
                  );
                })}
              </div>

              {/* The Editor Canvas Component */}
              <div className="absolute inset-0 flex flex-col sm:pt-12">
                <EditorCanvas />
              </div>
            </div>
          </section>

          {/* Add Details Section */}
          <section className="space-y-5 max-w-[420px] mx-auto px-4 sm:px-0 flex-0.5">
            <h2 className="text-center text-base font-bold tracking-wide text-slate-900 uppercase">
              Add Details
            </h2>

            {/* Active Zone Config Card */}
            {activeZone && (
              <div className="border-2 border-slate-200/80 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6 transition-all duration-300">
                {activeZone.type === "text" ? (
                  activeZone.textFields && activeZone.textFields.length > 0 ? (
                    <div className="space-y-6">
                      {activeZone.textFields.map((tf, tfIdx) => {
                        const tb = getTextboxForField(tf.id, activeZone.id);
                        const currentText = tb ? tb.text : tf.text || "";
                        const currentFont = tb ? tb.fontFamily : tf.fontFamily || "Arial";
                        const currentFontSize = tb ? tb.fontSize : tf.fontSize || 24;
                        const maxW = tf.width || activeZone.width || 200;
                        const maxH = tf.height || activeZone.height || 50;
                        const calcW = tb ? tb.calcTextWidth() : 0;
                        const calculatedMax = calcW > 0 ? Math.floor(Math.min((maxW * currentFontSize) / calcW, (maxH * currentFontSize) / (tb.height || currentFontSize * 1.2))) : 120;
                        const maxAllowedFontSize = Math.max(12, Math.min(120, calculatedMax));
                        const currentColor = tb ? tb.fill : tf.textColor || activeZone.textColor || "#000000";
                        const colorsList = getDisplayColors(tf.allowedColors && tf.allowedColors.length > 0 ? tf.allowedColors : activeZone.allowedColors);

                        return (
                          <div key={tf.id} className={cn("space-y-5", tfIdx > 0 && "pt-6 border-t border-slate-100")}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                                  <span className="text-red-500 text-sm">*</span> {tf.label || `Text Line ${tfIdx + 1}`} :
                                </label>
                                <span className="text-[11px] font-bold text-slate-400">
                                  {tf.maxLength ? `${currentText.length}/${tf.maxLength} chars` : tf.maxWords ? `${countWords(currentText)}/${tf.maxWords} words` : ""}
                                </span>
                              </div>
                              <input
                                type="text"
                                className="w-full h-12 px-4 rounded-md border-2 border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                                value={currentText}
                                placeholder={tf.label || "Enter text here"}
                                onChange={(e) => handleTextChange(e.target.value, tf.id, activeZone.id)}
                              />
                            </div>

                            <div className="space-y-2.5">
                              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                                Select Font :
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {getDisplayFonts(tf.allowedFonts && tf.allowedFonts.length > 0 ? tf.allowedFonts : activeZone.allowedFonts).map((fontName) => {
                                  const isSelected = currentFont === fontName;
                                  return (
                                    <button
                                      key={fontName}
                                      type="button"
                                      className={cn(
                                        "h-11 rounded-md border-2 text-xs font-bold transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm active:scale-95",
                                        isSelected
                                          ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20"
                                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                      )}
                                      style={{ fontFamily: fontName }}
                                      onClick={() => handleFontChange(fontName, tf.id, activeZone.id)}
                                    >
                                      {fontName}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>


                            <div className="space-y-2.5">
                              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                                Select Color :
                              </label>
                              <div className="flex flex-wrap gap-2.5 items-center">
                                {colorsList.map((colVal) => {
                                  const isSelected = currentColor === colVal;
                                  return (
                                    <button
                                      key={colVal}
                                      type="button"
                                      className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer shadow-sm active:scale-95 relative flex items-center justify-center",
                                        isSelected ? "border-slate-900 ring-4 ring-slate-900/10 scale-110" : "border-slate-200 hover:scale-105"
                                      )}
                                      style={{ backgroundColor: colVal }}
                                      onClick={() => handleColorChange(colVal, tf.id, activeZone.id)}
                                    >
                                      {isSelected && (
                                        <span className={cn("text-xs font-bold", colVal.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white")}>
                                          ✓
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                            <span className="text-red-500 text-sm">*</span> {activeZone.label || "Text Line"} :
                          </label>
                          <span className="text-[11px] font-bold text-slate-400">
                            {activeZone.maxLength ? `${(getTextboxForField(undefined, activeZone.id)?.text || "").length}/${activeZone.maxLength} chars` : activeZone.maxWords ? `${countWords(getTextboxForField(undefined, activeZone.id)?.text || "")}/${activeZone.maxWords} words` : ""}
                          </span>
                        </div>
                        <input
                          type="text"
                          className="w-full h-12 px-4 rounded-md border-2 border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                          value={getTextboxForField(undefined, activeZone.id)?.text || ""}
                          placeholder={activeZone.label || "Enter text here"}
                          onChange={(e) => handleTextChange(e.target.value, undefined, activeZone.id)}
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                          Select Font :
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {getDisplayFonts(activeZone.allowedFonts).map((fontName) => {
                            const tb = getTextboxForField(undefined, activeZone.id);
                            const currentFont = tb ? tb.fontFamily : activeZone.fontFamily || "Arial";
                            const isSelected = currentFont === fontName;

                            return (
                              <button
                                key={fontName}
                                type="button"
                                className={cn(
                                  "h-11 rounded-md border-2 text-xs font-bold transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm active:scale-95",
                                  isSelected
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                )}
                                style={{ fontFamily: fontName }}
                                onClick={() => handleFontChange(fontName, undefined, activeZone.id)}
                              >
                                {fontName}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                          Select Color :
                        </label>
                        <div className="flex flex-wrap gap-2.5 items-center">
                          {getDisplayColors(activeZone.allowedColors).map((colVal) => {
                            const tb = getTextboxForField(undefined, activeZone.id);
                            const currentColor = tb ? tb.fill : activeZone.textColor || "#000000";
                            const isSelected = currentColor === colVal;

                            return (
                              <button
                                key={colVal}
                                type="button"
                                className={cn(
                                  "w-8 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer shadow-sm active:scale-95 relative flex items-center justify-center",
                                  isSelected ? "border-slate-900 ring-4 ring-slate-900/10 scale-110" : "border-slate-200 hover:scale-105"
                                )}
                                style={{ backgroundColor: colVal }}
                                onClick={() => handleColorChange(colVal, undefined, activeZone.id)}
                              >
                                {isSelected && (
                                  <span className={cn("text-xs font-bold", colVal.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white")}>
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-5">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                      <span className="text-red-500 text-sm">*</span> Image Options :
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                      {/* Upload your own */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/20 transition-all duration-300 aspect-square group cursor-pointer shadow-sm"
                      >
                        <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                        <span className="text-[11px] whitespace-nowrap font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                          Your Logo
                        </span>
                        <span className="text-[10px] text-pink-600 font-extrabold mt-0.5">
                          + ₹{logoUploadPrice}
                        </span>
                      </button>

                      {/* Admin preset images */}
                      {presetImages.map((img, idx) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => addPresetImage(img.url, img.name)}
                          className="flex flex-col items-center justify-center p-2 border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/20 transition-all duration-300 aspect-square group cursor-pointer shadow-sm overflow-hidden bg-white"
                        >
                          <img
                            src={getImageUrl(img.url)}
                            alt={img.name || ""}
                            className="w-10 h-10 object-contain mb-1.5"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                          <span className="text-[10px] font-extrabold text-slate-800 truncate w-full text-center px-1">
                            {img.name?.replace(/\.[^/.]+$/, "") || `Image ${idx + 1}`}
                          </span>
                        </button>
                      ))}

                      {/* Blank / Clear */}
                      <button
                        type="button"
                        onClick={clearZoneImage}
                        className="flex flex-col items-center justify-center p-4 border-2 border-slate-200 rounded-2xl hover:border-red-200 hover:bg-red-50/50 transition-all duration-300 aspect-square group cursor-pointer shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-full border-2 border-slate-400 flex items-center justify-center mb-2 text-slate-400 group-hover:text-red-500 group-hover:border-red-500 transition-colors">
                          ⃠
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-red-600 transition-colors">
                          Blank
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Grand Total Section */}
        <section className="max-w-2xl mx-auto pt-4 border-t-2 border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-lg font-extrabold text-slate-900 tracking-tight">
            Grand Total :
          </div>
          <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-5 shadow-md w-full sm:w-72 space-y-2 text-xs font-bold text-slate-700">
            <div className="flex justify-between">
              <span>Base Price :</span>
              <span className="font-extrabold text-slate-900">₹ {basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Addons Total :</span>
              <span className="font-extrabold text-slate-900">₹ {addonsTotal.toFixed(2)}</span>
            </div>
            {logoUploadPrice > 0 && (
              <div className="flex justify-between">
                <span>Logo Upload Charge :</span>
                <span className="font-extrabold text-slate-900">₹ {logoCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Other Charges :</span>
              <span>₹ 0.00</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total :</span>
              <span className="text-pink-600">₹ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Checkout Button */}
        <section className="max-w-2xl mx-auto pb-6">
          <button
            type="button"
            onClick={handleCheckout}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-xl shadow-slate-900/20 transition-all duration-300 flex items-center justify-center text-base tracking-wider uppercase cursor-pointer"
          >
            Confirm & Checkout
          </button>
        </section>
      </main>
    </div>
  );
};
