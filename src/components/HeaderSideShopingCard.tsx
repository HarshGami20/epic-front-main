"use client"
import { Tab, Nav } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import { useCartWishlistStore } from "@/stores/useCartWishlistStore";
import { getImageUrl } from "@/lib/imageUtils";

interface propType {
    tabactive: string;
}

export default function HeaderSideShoppingCard(props: propType) {
    const {
        cart,
        wishlist,
        removeFromCart,
        updateQuantity,
        removeFromWishlist
    } = useCartWishlistStore();

    const totalPrice = cart.reduce((acc: number, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="dz-tabs">
            <Tab.Container defaultActiveKey={props.tabactive}>
                <Nav as="ul" className="nav nav-tabs center">
                    <Nav.Item as="li">
                        <Nav.Link as="button" className="nav-link" eventKey="ShoppingCart">Shopping Cart
                            <span className="badge badge-light">{cart.length}</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li">
                        <Nav.Link as="button" eventKey="Wishlist">Wishlist
                            <span className="badge badge-light">{wishlist.length}</span>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content className="pt-4" id="dz-shopcart-sidebar">
                    <Tab.Pane eventKey="ShoppingCart">
                        <div className="shop-sidebar-cart">
                            {cart.length > 0 ? (
                                <>
                                    <ul className="sidebar-cart-list">
                                        {cart.map((elem, index) => (
                                            <li key={elem.id}>
                                                <div className="cart-widget">
                                                    <div className="dz-media me-3">
                                                        <Image src={getImageUrl(elem.image)} alt={elem.name} width={60} height={60} />
                                                    </div>
                                                    <div className="cart-content">
                                                        <h6 className="title">
                                                            <Link href={`/products/${elem.slug}`}>{elem.name}</Link>
                                                        </h6>
                                                        <div className="d-flex align-items-center">
                                                            <div className="btn-quantity light quantity-sm me-3">
                                                                <div className="input-group bootstrap-touchspin">
                                                                    <input type="text" value={elem.quantity} className="form-control" readOnly />
                                                                    <span className="input-group-btn-vertical">
                                                                        <button className="btn btn-default bootstrap-touchspin-up" type="button"
                                                                            onClick={() => updateQuantity(elem.id, elem.quantity + 1)}
                                                                        >
                                                                            <i className="fa-solid fa-plus" />
                                                                        </button>
                                                                        <button className="btn btn-default bootstrap-touchspin-down" type="button"
                                                                            onClick={() => updateQuantity(elem.id, elem.quantity - 1)}
                                                                        >
                                                                            <i className="fa-solid fa-minus" />
                                                                        </button>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <h6 className="dz-price mb-0">${(elem.price * elem.quantity).toFixed(2)}</h6>
                                                        </div>
                                                    </div>
                                                    <Link href="#" className="dz-close" onClick={() => removeFromCart(elem.id)}>
                                                        <i className="ti-close" />
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="cart-total">
                                        <h5 className="mb-0">Subtotal:</h5>
                                        <h5 className="mb-0">${totalPrice.toFixed(2)}</h5>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="shipping-time">
                                            <div className="dz-icon">
                                                <i className="flaticon flaticon-ship" />
                                            </div>
                                            <div className="shipping-content">
                                                <h6 className="title pe-4">Congratulations, you've got free shipping!</h6>
                                                <div className="progress">
                                                    <div className="progress-bar progress-animated border-0" style={{ width: "100%" }}>
                                                        <span className="sr-only">100% Complete</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href="/shop-checkout" className="btn btn-outline-secondary btn-block m-b20">Checkout</Link>
                                        <Link href="/shop-cart" className="btn btn-secondary btn-block">View Cart</Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-5">
                                    <p>Your cart is empty</p>
                                    <Link href="/shop" className="btn btn-secondary">Shop Now</Link>
                                </div>
                            )}
                        </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="Wishlist">
                        <div className="shop-sidebar-cart">
                            {wishlist.length > 0 ? (
                                <>
                                    <ul className="sidebar-cart-list">
                                        {wishlist.map((elem) => (
                                            <li key={elem.productId}>
                                                <div className="cart-widget">
                                                    <div className="dz-media me-3">
                                                        <Image src={getImageUrl(elem.image)} alt={elem.name} width={60} height={60} />
                                                    </div>
                                                    <div className="cart-content">
                                                        <h6 className="title">
                                                            <Link href={`/products/${elem.slug}`}>{elem.name}</Link>
                                                        </h6>
                                                        <div className="d-flex align-items-center">
                                                            <h6 className="dz-price mb-0">${elem.price.toFixed(2)}</h6>
                                                        </div>
                                                    </div>
                                                    <Link href="#" className="dz-close" onClick={() => removeFromWishlist(elem.productId)}>
                                                        <i className="ti-close" />
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto">
                                        <Link href="/shop-wishlist" className="btn btn-secondary btn-block">Check Your Favourite</Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-5">
                                    <p>Your wishlist is empty</p>
                                </div>
                            )}
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    )
}
