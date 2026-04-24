"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicApiUrl } from "@/lib/env";

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children?: Category[];
}

export default function CategoryMenuItem() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 991);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/public/categories`);
                const json = await res.json();

                let data: Category[] = [];
                if (json && json.data) data = json.data;
                else if (Array.isArray(json)) data = json;

                // Build hierarchy tree
                const map = new Map<string, Category>();
                data.forEach(item => map.set(item.id, { ...item, children: [] }));

                const tree: Category[] = [];
                map.forEach(item => {
                    if (item.parentId && map.has(item.parentId)) {
                        map.get(item.parentId)!.children!.push(item);
                    } else {
                        tree.push(item);
                    }
                });

                setCategories(tree);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const toggleItem = (id: string, e: React.MouseEvent) => {
        if (!isMobile) return;
        e.preventDefault();
        e.stopPropagation();
        setOpenItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (loading) {
        return (
            <ul className="nav navbar-nav cat-menu-list">
                {[1, 2, 3, 4, 5].map(i => (
                    <li key={i} className="cat-skeleton-item">
                        <span className="cat-skeleton-line" />
                    </li>
                ))}
            </ul>
        );
    }

    const renderLevel = (items: Category[], isRoot: boolean, depth: number = 0) => {
        return items.map(category => {
            const hasChildren = !!(category.children && category.children.length > 0);
            const isOpen = openItems.has(category.id);

            if (isRoot) {
                return (
                    <li
                        key={category.id}
                        className={`cate-item${hasChildren ? " cate-drop" : ""}${isOpen ? " mobile-open" : ""}`}
                    >
                        <Link
                            href={`/shop?category=${encodeURIComponent(category.name)}`}
                            onClick={hasChildren && isMobile ? (e) => toggleItem(category.id, e) : undefined}
                        >
                            <i className="icon feather icon-arrow-right cate-icon" />
                            <span className="cate-name">{category.name}</span>
                            {hasChildren && (
                                <span className={`menu-icon${isOpen ? " rotated" : ""}`}>
                                    <i className="icon feather icon-chevron-right" />
                                </span>
                            )}
                        </Link>
                        {hasChildren && (
                            <ul className={`sub-menu cate-submenu${isOpen ? " mobile-show" : ""}`}>
                                {renderLevel(category.children!, false, depth + 1)}
                            </ul>
                        )}
                    </li>
                );
            } else {
                return (
                    <li
                        key={category.id}
                        className={`cate-item${hasChildren ? " cate-drop" : ""}${isOpen ? " mobile-open" : ""}`}
                    >
                        <Link
                            href={`/shop?category=${encodeURIComponent(category.name)}`}
                            onClick={hasChildren && isMobile ? (e) => toggleItem(category.id, e) : undefined}
                        >
                            <span className="cate-name">{category.name}</span>
                            {hasChildren && (
                                <span className={`menu-icon ms-auto${isOpen ? " rotated" : ""}`}>
                                    <i className="icon feather icon-chevron-right" />
                                </span>
                            )}
                        </Link>
                        {hasChildren && (
                            <ul className={`sub-menu cate-submenu${isOpen ? " mobile-show" : ""}`}>
                                {renderLevel(category.children!, false, depth + 1)}
                            </ul>
                        )}
                    </li>
                );
            }
        });
    };

    return (
        <ul className="nav navbar-nav cat-menu-list">
            {renderLevel(categories, true)}
        </ul>
    );
}
