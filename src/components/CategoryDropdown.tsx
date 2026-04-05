"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { getPublicApiUrl } from "@/lib/env";

function buildCategoryTree(catData: any[]): any[] {
    const map = new Map<string, any>();
    catData.forEach((item) => map.set(item.id, { ...item, children: [] as any[] }));
    const tree: any[] = [];
    map.forEach((item) => {
        if (item.parentId && map.has(item.parentId)) {
            map.get(item.parentId)!.children.push(item);
        } else {
            tree.push(item);
        }
    });
    return tree;
}

function flattenCategoryNames(nodes: any[]): string[] {
    const names: string[] = [];
    const walk = (n: any) => {
        if (n?.name) names.push(n.name);
        n?.children?.forEach(walk);
    };
    nodes.forEach(walk);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

type Props = {
    /** Selected category **name** (empty = all). Controlled when `onChange` is set. */
    value?: string;
    onChange?: (categoryName: string) => void;
};

export default function Categorydropdown({ value, onChange }: Props) {
    const [internal, setInternal] = useState("");
    const [names, setNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const controlled = typeof onChange === "function";
    const selected = controlled ? (value ?? "") : internal;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const url = getPublicApiUrl();
                const res = await fetch(`${url}/public/categories`);
                const catJson = await res.json();
                let catData: any[] = [];
                if (catJson?.data) catData = catJson.data;
                else if (Array.isArray(catJson)) catData = catJson;
                const tree = buildCategoryTree(catData);
                const flat = flattenCategoryNames(tree);
                if (!cancelled) setNames(flat);
            } catch {
                if (!cancelled) setNames([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const setCat = (name: string) => {
        if (controlled) onChange!(name);
        else setInternal(name);
    };

    const label = selected ? selected : loading ? "Loading…" : "All Categories";

    return (
        <Dropdown className="bootstrap-select default-select">
            <Dropdown.Toggle as="div" className="btn dropdown-toggle btn-light show">
                {label}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => setCat("")}>All Categories</Dropdown.Item>
                {names.map((n) => (
                    <Dropdown.Item key={n} onClick={() => setCat(n)}>
                        {n}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}
