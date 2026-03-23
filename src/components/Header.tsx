"use client"

import { useEffect, useReducer, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import IMAGES from "../constant/theme";
import Menus from "./Menus";
import HeadSearchBar from "./HeadSearchBar";
import HeaderSidbar from "./HeaderSidbar";
import HeaderSideShoppingCard from "./HeaderSideShopingCard";
import CategoryMenuItem from "./CategoryMenuItem";
import Categorydropdown from "./CategoryDropdown";

interface DesignType {
    design: string
}

interface State {
    headerFix: boolean;
    isBottom: boolean;
    isActive: boolean;
    previousScroll: number;
    openSidebar: boolean;
    openSearchBar: boolean;
    headSideBar: boolean;
    headShoppingSidebar: boolean;
    basketShoppingCard: boolean;
    categoryActive: boolean;
}

type Action =
    | { type: 'FIX_HEADER'; payload: boolean }
    | { type: 'FIX_BOTTOM'; payload: boolean }
    | { type: 'SET_IS_ACTIVE'; payload: boolean }
    | { type: 'SET_PREVIOUS_SCROLL'; payload: number }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'TOGGLE_SEARCH_BAR' }
    | { type: 'TOGGLE_HEAD_SIDEBAR' }
    | { type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' }
    | { type: 'TOGGLE_BASKET_SHOPPING_CARD' }
    | { type: 'TOGGLE_CATEGORY_ACTIVE' };


const initialState = {
    headerFix: false,
    isBottom: false,
    isActive: false,
    previousScroll: 0,
    openSidebar: false,
    openSearchBar: false,
    headSideBar: false,
    headShoppingSidebar: false,
    basketShoppingCard: false,
    categoryActive: false,
};


function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FIX_HEADER':
            return { ...state, headerFix: action.payload };
        case 'FIX_BOTTOM':
            return { ...state, isBottom: action.payload };
        case 'SET_IS_ACTIVE':
            return { ...state, isActive: action.payload };
        case 'SET_PREVIOUS_SCROLL':
            return { ...state, previousScroll: action.payload };
        case 'TOGGLE_SIDEBAR':
            return { ...state, openSidebar: !state.openSidebar };
        case 'TOGGLE_SEARCH_BAR':
            return { ...state, openSearchBar: !state.openSearchBar };
        case 'TOGGLE_HEAD_SIDEBAR':
            return { ...state, headSideBar: !state.headSideBar };
        case 'TOGGLE_HEAD_SHOPPING_SIDEBAR':
            return { ...state, headShoppingSidebar: !state.headShoppingSidebar };
        case 'TOGGLE_BASKET_SHOPPING_CARD':
            return { ...state, basketShoppingCard: !state.basketShoppingCard };
        case 'TOGGLE_CATEGORY_ACTIVE':
            return { ...state, categoryActive: !state.categoryActive };
        default:
            throw new Error();
    }
}


const Header = ({ design }: DesignType) => {

    const [state, dispatch] = useReducer(reducer, initialState);
    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        // Set initial window width on client
        setWindowWidth(window.innerWidth);

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const scrollHandler = () => {
        if (window.scrollY > 80) {
            dispatch({ type: 'FIX_HEADER', payload: true });
        } else {
            dispatch({ type: 'FIX_HEADER', payload: false });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth <= 768) {
                const currentScroll = window.scrollY;
                const bodyHeight = document.body.scrollHeight;
                const windowHeight = window.innerHeight;

                dispatch({ type: 'FIX_BOTTOM', payload: currentScroll + windowHeight >= bodyHeight });
                dispatch({ type: 'SET_IS_ACTIVE', payload: currentScroll > state.previousScroll });

                dispatch({ type: 'SET_PREVIOUS_SCROLL', payload: currentScroll });
            }
        };

        const combinedHandler = () => {
            scrollHandler();
            handleScroll();
        };

        window.addEventListener("scroll", combinedHandler);
        return () => {
            window.removeEventListener("scroll", combinedHandler);
        };
    }, [state.previousScroll]);
    return (
        <>
            <header className={`site-header mo-left header ${design}`}>
                {/*  Main Header  */}
                <div className={`sticky-header main-bar-wraper navbar-expand-lg ${state.headerFix ? 'is-fixed' : ''}`}>
                    <div className="main-bar clearfix">
                        <div className="container-fluid clearfix d-lg-flex d-block">
                            {design === "header-text-white header-transparent" ?
                                ''
                                :
                                <div className="logo-header logo-dark me-md-5">
                                    <Link href="/"><Image src={IMAGES.logo} alt="logo" /></Link>
                                </div>
                            }
                            {design === "header-text-white header-transparent" ?
                                <div className="logo-header me-md-5">
                                    <Link href="/" className=" logo-light"><Image src={IMAGES.LogoWhite} alt="logo-white" /></Link>
                                    <Link href="/" className="logo-dark"><Image src={IMAGES.logopng} alt="logo" /></Link>
                                </div>
                                :
                                ''
                            }
                            <button className={`navbar-toggler collapsed navicon justify-content-end ${state.openSidebar ? "open" : ""}`}
                                // onClick={()=>setOpenSidebar(!openSidebar)}
                                // onClick={}
                                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>

                            {/*  Main Nav  */}
                            <div className={`header-nav w3menu navbar-collapse collapse justify-content-start ${state.openSidebar ? "show" : ""}`}
                                id="navbarNavDropdown"
                            >
                                <div className="logo-header">
                                    <Link href="/"><Image src={IMAGES.logo} alt="logo" /></Link>
                                </div>
                                <div className="browse-category-menu" style={{ marginRight: "10px", position: "relative" }}>
                                    <Link href="#" className={`category-btn ${state.categoryActive ? "active" : ""}`}
                                        onClick={() => dispatch({ type: 'TOGGLE_CATEGORY_ACTIVE' })}
                                        style={{ height: "50px", backgroundColor: "var(--light-dark)", borderRadius: "10px", display: "flex", alignItems: "center", padding: "0 20px" }}
                                    >
                                        <div className="category-menu me-3">
                                            <span style={{ background: "var(--secondary)" }}></span>
                                            <span style={{ background: "var(--secondary)" }}></span>
                                            <span style={{ background: "var(--secondary)" }}></span>
                                        </div>
                                        <span className="category-btn-title" style={{ color: "var(--title)", fontWeight: "600" }}>
                                            Browse Categories
                                        </span>
                                        <span className="toggle-arrow ms-auto">
                                            <i className="icon feather icon-chevron-down" />
                                        </span>
                                    </Link>
                                    <div className="category-menu-items"
                                        style={{
                                            display: state.categoryActive ? "block" : "none",
                                            transition: "all 0.5s ease",
                                            position: windowWidth > 991 ? "absolute" : "static",
                                            top: windowWidth > 991 ? "100%" : "auto",
                                            left: windowWidth > 991 ? "0" : "auto",
                                            width: windowWidth > 991 ? "280px" : "100%",
                                            boxShadow: windowWidth > 991 ? "0 10px 30px rgba(0,0,0,0.1)" : "none",
                                            zIndex: 999,
                                            backgroundColor: "#fff",
                                            borderRadius: windowWidth > 991 ? "0 0 10px 10px" : "0"
                                        }}
                                    >
                                        <CategoryMenuItem />
                                    </div>
                                </div>

                                {/* All menus item */}
                                <Menus />
                                {/* All menus item end*/}
                                <div className="dz-social-icon">
                                    <ul>
                                        <li><Link className="fab fa-facebook-f" target="_blank" href="https://www.facebook.com/dexignzone"></Link></li>
                                        <li><Link className="fab fa-twitter" target="_blank" href="https://twitter.com/dexignzones"></Link></li>
                                        <li><Link className="fab fa-linkedin-in" target="_blank" href="https://www.linkedin.com/showcase/3686700/admin/"></Link></li>
                                        <li><Link className="fab fa-instagram" target="_blank" href="https://www.instagram.com/dexignzone/"></Link></li>
                                    </ul>
                                </div>
                            </div>
                            {/* EXTRA NAV  */}
                            <div className={`extra-nav ${state.isBottom ? "bottom-end" : ""} ${state.isActive ? "active" : ""}`}>
                                <div className="extra-cell">
                                    <ul className="header-right">
                                        <li className="nav-item login-link">
                                            <Link className="nav-link" href="/login">
                                                Login / Register
                                            </Link>
                                        </li>
                                        <li className="nav-item search-link">
                                            <Link className="nav-link" href="#"
                                                // onClick={()=>setOpenSearchBar(true)}
                                                onClick={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                                            >
                                                <i className="iconly-Light-Search" />
                                            </Link>
                                        </li>
                                        <li className="nav-item wishlist-link">
                                            <Link className="nav-link" href="#"
                                                // onClick={()=>setHeadShoppingSidebar(true)}
                                                onClick={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
                                            >
                                                <i className="iconly-Light-Heart2" />
                                            </Link>
                                        </li>
                                        <li className="nav-item cart-link">
                                            <Link href="#" className="nav-link cart-btn"
                                                // onClick={()=>setBasketShoppingCard(true)}
                                                onClick={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
                                            >
                                                <i className="iconly-Broken-Buy" />
                                                <span className="badge badge-circle">5</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  Main Header End  */}
            </header>
            {/*  SearchBar  */}
            <Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
                show={state.openSearchBar} onHide={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                placement={'top'}
            >
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
                    // onClick={()=>setOpenSearchBar(false)}
                    onClick={() => dispatch({ type: 'TOGGLE_SEARCH_BAR' })}
                >
                    &times;
                </button>
                <HeadSearchBar />
            </Offcanvas>
            {/*  SearchBar  */}

            {/* - Sidebar finter */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" show={state.headSideBar}
                // onHide={setHeadSideBar}
                onHide={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
            >
                <button type="button" className="btn-close"
                    // onClick={()=>setHeadSideBar(false)}
                    onClick={() => dispatch({ type: 'TOGGLE_HEAD_SIDEBAR' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <HeaderSidbar />
                </div>
            </Offcanvas>
            {/*  Sidebar cart  */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={state.headShoppingSidebar}
                // onHide={setHeadShoppingSidebar}
                onHide={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
            >
                <button type="button" className="btn-close"
                    // onClick={()=>setHeadShoppingSidebar(false)}
                    onClick={() => dispatch({ type: 'TOGGLE_HEAD_SHOPPING_SIDEBAR' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <div className="product-description">
                        <HeaderSideShoppingCard tabactive="Wishlist" />
                    </div>
                </div>
            </Offcanvas>

            {/*  Shopping Sidebar Basket   */}
            <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={state.basketShoppingCard}
                // onHide={setBasketShoppingCard}
                onHide={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
            >
                <button type="button" className="btn-close"
                    // onClick={()=>setBasketShoppingCard(false)}
                    onClick={() => dispatch({ type: 'TOGGLE_BASKET_SHOPPING_CARD' })}
                >
                    &times;
                </button>
                <div className="offcanvas-body">
                    <div className="product-description">
                        <HeaderSideShoppingCard tabactive="ShoppingCart" />
                    </div>
                </div>
            </Offcanvas>
        </>
    );
};

export default Header;