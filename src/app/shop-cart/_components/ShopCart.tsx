"use client"
import Link from 'next/link' 
import Image from 'next/image';
import CommanBanner from "@/components/CommanBanner";
import IMAGES from "@/constant/theme";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { getImageUrl } from "@/lib/imageUtils";
import { toast } from "sonner";

export default function ShopCart(){
    const { cart, removeFromCart, updateQuantity } = useCartWishlistStore();

    const totalPrice = cart.reduce((acc: number, item) => acc + (item.price * item.quantity), 0);

    const handleRemove = (id: string) => {
        removeFromCart(id);
        toast.success("Item removed from cart");
    };

    return(
        <div className="page-content bg-light">
            <CommanBanner parentText="Home" currentText="Shop Cart" mainText="Shop Cart" image={IMAGES.BackBg1.src}  />
            <section className="content-inner shop-account">			
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="table-responsive">
                                <table className="table check-tbl">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th></th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.length > 0 ? (
                                            cart.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="product-item-img">
                                                        <Link href={`/products/${item.slug || ""}`}>
                                                            <Image src={getImageUrl(item.image)} alt={item.name} width={80} height={80} className="object-contain" />
                                                        </Link>
                                                    </td>
                                                    <td className="product-item-name">
                                                        <Link href={`/products/${item.slug || ""}`} className="font-semibold text-slate-800">
                                                            {item.name}
                                                        </Link>
                                                        {item.variation && item.variation.selectedVariantId && (
                                                            <p className="text-xs text-slate-400 mt-1 uppercase">
                                                                Color: {item.variation.selectedVariantId}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="product-item-price">₹{item.price.toFixed(2)}</td>
                                                    <td className="product-item-quantity">
                                                        <div className="quantity btn-quantity style-1 me-3">
                                                            <div className="input-group bootstrap-touchspin">
                                                                <input type="text" value={item.quantity} className="form-control" readOnly/>
                                                                <span className="input-group-btn-vertical">
                                                                    <button className="btn btn-default bootstrap-touchspin-up" type="button"
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    >
                                                                        <i className="fa-solid fa-plus"/>
                                                                    </button>
                                                                    <button className="btn btn-default bootstrap-touchspin-down" type="button"
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    >
                                                                        <i className="fa-solid fa-minus"/>
                                                                    </button>
                                                                </span>
                                                            </div> 
                                                        </div>
                                                    </td>
                                                    <td className="product-item-totle">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                    <td className="product-item-close">
                                                        <button onClick={() => handleRemove(item.id)} className="bg-transparent border-0 text-slate-400 hover:text-red-500 transition-colors">
                                                            <i className="ti-close"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5 text-slate-400">
                                                    Your cart is empty. <Link href="/shop" className="text-primary hover:underline">Shop now</Link>
                                                </td>
                                            </tr>
                                        )}                                        
                                    </tbody>
                                </table>
                            </div>
                            <div className="row shop-form m-t30">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="input-group mb-0">
                                            <input name="dzEmail" required type="text" className="form-control" placeholder="Coupon Code" />
                                            <div className="input-group-addon">
                                                <button name="submit" value="Submit" type="submit" className="btn coupon">
                                                    Apply Coupon
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 text-end">
                                    <Link href="/shop" className="btn btn-secondary">CONTINUE SHOPPING</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <h4 className="title mb15">Cart Total</h4>
                            <div className="cart-detail">
                                <button type="button" className="btn btn-outline-secondary w-100 m-b20">Bank Offer 5% Cashback</button>
                                <div className="icon-bx-wraper style-4 m-b15">
                                    <div className="icon-bx">
                                        <i className="flaticon flaticon-ship"></i>
                                    </div>
                                    <div className="icon-content">
                                        <span className="font-14">FREE SHIPPING</span>
                                        <h6 className="dz-title">Enjoy Free Standard Delivery</h6>
                                    </div>
                                </div>
                                <div className="icon-bx-wraper style-4 m-b30">
                                    <div className="icon-bx">
                                        <i className="flaticon flaticon-like" />
                                    </div>
                                    <div className="icon-content">
                                        <h6 className="dz-title">Secured Checkout</h6>
                                        <p>Your transactions are safe and encrypted.</p>
                                    </div>
                                </div>
                                <div className="save-text">
                                    <i className="icon feather icon-check-circle"></i>
                                    <span className="m-l10">GST included where applicable</span>
                                </div>
                                <table>
                                    <tbody>
                                        <tr className="total">
                                            <td>
                                                <h6 className="mb-0">Total</h6>
                                            </td>
                                            <td className="price">
                                                ₹{totalPrice.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <Link 
                                    href={cart.length > 0 ? "/checkout?mode=cart" : "#"} 
                                    onClick={() => {
                                        localStorage.removeItem("checkout_item");
                                    }}
                                    className={`btn btn-secondary w-100 ${cart.length === 0 ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    PLACE ORDER
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
