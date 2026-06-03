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
          setPresetImages(data);
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

  const getDisplayPresetImages = () => {
    if (!activeZone) return [];
    const allowed = activeZone.allowedImages;
    const hasAll = !allowed || allowed.length === 0 || allowed.includes('all');
    if (hasAll) {
      return presetImages;
    }
    return presetImages.filter((img) => img.url && allowed.includes(img.url));
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
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 flex flex-col font-sans pb-16 selection:bg-indigo-500 selection:text-white">
      {/* Hidden file input for image upload */}
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 h-16 bg-white backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all hover:scale-105 active:scale-95"
          title="Reset Canvas"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Design Studio</span>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 -mt-0.5">
            Epic Studio
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/shop")}
          className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all hover:scale-105 active:scale-95"
          title="Exit Studio"
        >
          <X className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8 animate-fade-in">
        
        {/* Premium Addons Section */}
        {styleVariantsForPicker.length > 0 && (
          <section className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-extrabold tracking-wider text-slate-800 uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                Premium Addons
              </h2>
              {selectedStyleVariantId && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Option Selected
                </span>
              )}
            </div>
            <div className="w-full mx-auto py-2">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView={3}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                loop={styleVariantsForPicker.length > 3}
                breakpoints={{
                  320: { slidesPerView: 2, spaceBetween: 12 },
                  640: { slidesPerView: 3, spaceBetween: 16 },
                  1024: { slidesPerView: 4, spaceBetween: 16 },
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
                          "w-full rounded-md border-2 p-1.5 text-left transition-all duration-300 flex flex-col bg-white shadow-sm hover:shadow-md cursor-pointer group",
                          isActive
                            ? "border-pink-500 ring-4 ring-pink-500/10 bg-pink-50/20"
                            : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="relative w-full aspect-square rounded-md overflow-hidden bg-slate-50 group-hover:scale-[1.01] transition-transform duration-300">
                          <img src={mockup} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0 p-2.5">
                          <div className="text-xs font-extrabold text-slate-800 leading-snug line-clamp-1">
                            {s.title || "Option"}
                          </div>
                          <div className="text-[11px] font-black text-indigo-600 mt-1 flex items-center justify-between">
                            <span>{s.priceAddon > 0 ? `+ ₹${Number(s.priceAddon).toFixed(2)}` : "Free"}</span>
                            {isActive && <span className="text-[10px] bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700">Active</span>}
                          </div>
                        </div>
                      </button>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </section>
        )}

        <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-8">
          
          {/* Creative Canvas Section */}
          <section className="space-y-4 flex-1 w-full sticky top-16 lg:top-24 z-30 bg-[#faf9f6] pb-4">
            <h2 className="text-center text-base font-bold tracking-wide text-slate-900 uppercase">
              Creative Canvas
            </h2>
            <div className="relative border-0 sm:border-2 border-solid border-black rounded-none sm:rounded-3xl overflow-hidden bg-black shadow-none sm:shadow-xl sm:shadow-slate-200/30 aspect-[4/3] -mx-4 sm:mx-auto w-[calc(100%+2rem)] sm:w-full max-w-2xl flex flex-col group">
              {/* Reset shortcut over canvas */}
              <button 
                onClick={handleReset} 
                className="absolute top-4 aspect-square w-8 h-8 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow border border-slate-100 hover:scale-105 active:scale-95 transition-all text-slate-500 hover:text-slate-800"
                title="Reset design"
              >
                <RotateCcw className="w-4 h-4 absolute inset-0 m-auto" />
              </button>

              {/* The Editor Canvas Component */}
              <div className="absolute inset-0 sm:inset-[2px] flex flex-col pt-0 bg-slate-50/50 rounded-none sm:rounded-[22px] overflow-hidden">
                <EditorCanvas />
              </div>
            </div>
          </section>

          {/* Add Details Section */}
          <section className="space-y-4 w-full lg:max-w-[460px] shrink-0">
            <h2 className="text-center text-base font-bold tracking-wide text-slate-900 uppercase">
              Add Details
            </h2>

            {/* Zone Selector Tabs */}
            {editableZones.length > 0 && (
              <div className="w-full flex flex-wrap gap-2 justify-start py-1">
                {editableZones.map((z) => {
                  const isActive = activeEditableZoneId === z.id;
                  const isImg = z.type === "image";
                  const typeZones = editableZones.filter(x => x.type === z.type);
                  const indexInType = typeZones.findIndex(x => x.id === z.id);
                  const num = indexInType !== -1 ? indexInType + 1 : 1;
                  const label = z.label || (isImg ? `Image ${num}` : `Text ${num}`);

                  return (
                    <button
                      key={z.id}
                      onClick={() => setActiveEditableZoneId(z.id)}
                      className={cn(
                        "px-4 py-2 rounded-md text-xs font-bold transition-all duration-300 border shadow-sm cursor-pointer uppercase tracking-wider active:scale-95",
                        isImg
                          ? isActive
                            ? "bg-[#a3e635] border-[#a3e635] text-slate-900 shadow-sm"
                            : "bg-white border-[#a3e635] text-[#65a30d] hover:bg-[#a3e635]/10"
                          : isActive
                            ? "bg-[#2b99ff] border-[#2b99ff] text-white shadow-sm"
                            : "bg-white border-[#2b99ff] text-[#2b99ff] hover:bg-[#2b99ff]/10"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Zone Config Card */}
            {activeZone ? (
              <div className="border border-slate-200 bg-white rounded-3xl p-6 sm:p-7 shadow-md space-y-6 transition-all">
                
                {activeZone.type === "text" ? (
                  activeZone.textFields && activeZone.textFields.length > 0 ? (
                    <div className="space-y-6">
                      {activeZone.textFields.map((tf, tfIdx) => {
                        const tb = getTextboxForField(tf.id, activeZone.id);
                        const currentText = tb ? tb.text : tf.text || "";
                        const currentFont = tb ? tb.fontFamily : tf.fontFamily || "Arial";
                        const currentColor = tb ? tb.fill : tf.textColor || activeZone.textColor || "#000000";
                        const colorsList = getDisplayColors(tf.allowedColors && tf.allowedColors.length > 0 ? tf.allowedColors : activeZone.allowedColors);

                        return (
                          <div key={tf.id} className={cn("space-y-4", tfIdx > 0 && "pt-5 border-t border-slate-100")}>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                  <span className="text-red-500 text-sm">*</span> {tf.label || `Text Line ${tfIdx + 1}`} :
                                </label>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {tf.maxLength ? `${currentText.length}/${tf.maxLength} Chars` : tf.maxWords ? `${countWords(currentText)}/${tf.maxWords} Words` : ""}
                                </span>
                              </div>
                              <input
                                type="text"
                                className="w-full h-11 px-4 rounded-md border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm bg-slate-50/10"
                                value={currentText}
                                placeholder={tf.label || "Enter text here"}
                                onChange={(e) => handleTextChange(e.target.value, tf.id, activeZone.id)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-800">
                                Select Font :
                              </label>
                              <div className="grid grid-cols-4 gap-2">
                                {getDisplayFonts(tf.allowedFonts && tf.allowedFonts.length > 0 ? tf.allowedFonts : activeZone.allowedFonts).map((fontName) => {
                                  const isSelected = currentFont === fontName;
                                  return (
                                    <button
                                      key={fontName}
                                      type="button"
                                      className={cn(
                                        "h-9 rounded-md border text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95",
                                        isSelected
                                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
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

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-800">
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
                                        "w-8 h-8 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 relative flex items-center justify-center hover:scale-110",
                                        isSelected ? "border-slate-800 ring-2 ring-slate-800/20 scale-110" : "border-slate-200"
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
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <span className="text-red-500 text-sm">*</span> {activeZone.label || "Text Line"} :
                          </label>
                          <span className="text-[10px] font-bold text-slate-400">
                            {activeZone.maxLength ? `${(getTextboxForField(undefined, activeZone.id)?.text || "").length}/${activeZone.maxLength} Chars` : activeZone.maxWords ? `${countWords(getTextboxForField(undefined, activeZone.id)?.text || "")}/${activeZone.maxWords} Words` : ""}
                          </span>
                        </div>
                        <input
                          type="text"
                          className="w-full h-11 px-4 rounded-md border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm bg-slate-50/10"
                          value={getTextboxForField(undefined, activeZone.id)?.text || ""}
                          placeholder={activeZone.label || "Enter text here"}
                          onChange={(e) => handleTextChange(e.target.value, undefined, activeZone.id)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800">
                          Select Font :
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {getDisplayFonts(activeZone.allowedFonts).map((fontName) => {
                            const tb = getTextboxForField(undefined, activeZone.id);
                            const currentFont = tb ? tb.fontFamily : activeZone.fontFamily || "Arial";
                            const isSelected = currentFont === fontName;

                            return (
                              <button
                                key={fontName}
                                type="button"
                                className={cn(
                                  "h-9 rounded-md border text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95",
                                  isSelected
                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
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

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800">
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
                                  "w-8 h-8 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 relative flex items-center justify-center hover:scale-115",
                                  isSelected ? "border-slate-850 ring-2 ring-slate-800/20 scale-110" : "border-slate-200"
                                )}
                                style={{ backgroundColor: colVal }}
                                onClick={() => handleColorChange(colVal, undefined, activeZone.id)}
                              >
                                {isSelected && (
                                  <span className={cn("text-xs font-bold", colVal.toLowerCase() === "#ffffff" ? "text-slate-950" : "text-white")}>
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
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-red-500 text-sm">*</span> Image Options :
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Upload your own */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-3.5 border border-dashed border-slate-200 hover:border-blue-500 rounded-lg hover:bg-blue-50/20 transition-all aspect-square group cursor-pointer shadow-sm bg-white"
                      >
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-1.5 transition-colors" />
                        <span className="text-[10px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          Your Logo
                        </span>
                        <span className="text-[9px] text-pink-600 font-bold mt-0.5">
                          + ₹{logoUploadPrice}
                        </span>
                      </button>

                      {/* Admin preset images */}
                      {getDisplayPresetImages().map((img, idx) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => addPresetImage(img.url, img.name)}
                          className="flex flex-col items-center justify-center p-2 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-slate-50/80 transition-all aspect-square group cursor-pointer shadow-sm overflow-hidden bg-white"
                        >
                          <img
                            src={getImageUrl(img.url)}
                            alt={img.name || ""}
                            className="w-10 h-10 object-contain mb-1.5 group-hover:scale-105 transition-transform"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                          <span className="text-[9px] font-bold text-slate-705 truncate w-full text-center px-1">
                            {img.name?.replace(/\.[^/.]+$/, "") || `Preset ${idx + 1}`}
                          </span>
                        </button>
                      ))}

                      {/* Blank / Clear */}
                      <button
                        type="button"
                        onClick={clearZoneImage}
                        className="flex flex-col items-center justify-center p-3.5 border border-slate-200 rounded-lg hover:border-red-300 hover:bg-red-50/30 transition-all aspect-square group cursor-pointer shadow-sm bg-white"
                      >
                        <div className="w-6 h-6 rounded-full border border-slate-350 flex items-center justify-center mb-1 text-slate-400 group-hover:text-red-500 group-hover:border-red-500 transition-colors text-xs font-bold">
                          ✕
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 group-hover:text-red-650 transition-colors">
                          Blank
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Grand Total Section */}
                <div className="flex justify-between items-start pt-5 border-t border-slate-200 mt-6">
                  <span className="text-sm font-extrabold text-slate-800">Grand Total :</span>
                  <div className="text-xs font-bold text-slate-500 space-y-1.5 text-right">
                    <div>Base Price : ₹ {basePrice.toFixed(2)}</div>
                    <div>Addons Total : ₹ {addonsTotal.toFixed(2)}</div>
                    <div>Other Charges : ₹ 0.00</div>
                    <div className="text-sm font-black text-slate-900 pt-1.5 border-t mt-1">Total : ₹ {grandTotal.toFixed(2)}</div>
                  </div>
                </div>

                {/* Confirm & Checkout Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-850 active:scale-[0.99] text-white font-extrabold rounded-md shadow-md transition-all flex items-center justify-center text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Confirm & Checkout
                  </button>
                </div>

              </div>
            ) : (
              <div className="border border-slate-200 bg-white rounded-3xl p-6 text-center shadow-sm">
                <p className="text-slate-500 text-sm">No customizer zones found on this product.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );

};
