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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/public/categories`);
                const json = await res.json();
                
                let data: Category[] = [];
                if (json && json.data) data = json.data;
                else if (Array.isArray(json)) data = json;

                // Build hierarchy
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

    if (loading) {
        return (
            <ul className="nav navbar-nav">
                <li>
                    <span className="p-3 d-block">Loading Categories...</span>
                </li>
            </ul>
        );
    }

    const renderLevel = (items: Category[], isRoot: boolean) => {
        return items.map(category => {
            const hasChildren = category.children && category.children.length > 0;
            
            if (isRoot) {
                return (
                    <li key={category.id} className={hasChildren ? "cate-drop" : ""}>
                        <Link href={`/shop?category=${encodeURIComponent(category.name)}`}>
                            <i className="icon feather icon-arrow-right"/>
                            <span>{category.name}</span>
                            {hasChildren && (
                                <span className="menu-icon">
                                    <i className="icon feather icon-chevron-right"/>
                                </span>
                            )}
                        </Link>
                        {hasChildren && (
                            <ul className="sub-menu">
                                {renderLevel(category.children!, false)}
                            </ul>
                        )}
                    </li>
                );
            } else {
                return (
                    <li key={category.id} className={hasChildren ? "cate-drop" : ""}>
                        <Link href={`/shop?category=${encodeURIComponent(category.name)}`}>
                            {category.name}
                            {hasChildren && (
                                <span className="menu-icon ms-auto">
                                    <i className="icon feather icon-chevron-right"/>
                                </span>
                            )}
                        </Link>
                        {hasChildren && (
                            <ul className="sub-menu">
                                {renderLevel(category.children!, false)}
                            </ul>
                        )}
                    </li>
                );
            }
        });
    };

    return (
        <ul className="nav navbar-nav">
            {renderLevel(categories, true)}
        </ul>
    );
}