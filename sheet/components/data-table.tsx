"use client"
import React, { createContext, useContext, useState, Children } from 'react';

const TableSectionContext = createContext<'head' | 'body'>('body');

export function TableHead({ children }: { children: React.ReactNode }) {
    return (
        <TableSectionContext.Provider value="head">
            {children}
        </TableSectionContext.Provider>
    );
}

export function TableBody({ children }: { children: React.ReactNode }) {
    return (
        <TableSectionContext.Provider value="body">
            {children}
        </TableSectionContext.Provider>
    );
}

export function TableRow({ children }: { children: React.ReactNode }) {
    return <tr>{children}</tr>;
}

export function TableCell({ children }: { children: React.ReactNode }) {
    const section = useContext(TableSectionContext);
    if (section === 'head') {
        return <th>{children}</th>;
    }
    return <td>{children}</td>;
}

function paginateData<T>(
    data: Array<T>,
    page: number,
    pageSize: number,
) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);
    const maxPages = Math.ceil(data.length / pageSize);
    return { pageData, maxPages };
}

export default function DataTable<T extends { id: number }>({
    data,
    children
}: {
    data: Array<T>;
    children: React.ReactNode;
}) {
    const [page, setPage] = useState(1);
    const pageSize = 9;
    const pageStart = (page - 1) * pageSize;
    const { maxPages } = paginateData(
        data,
        page,
        pageSize,
    );

    let theadChild: React.ReactNode = null;
    let tbodyChild: React.ReactNode = null;
    Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        if (child.type === TableHead && theadChild == null) {
            theadChild = (child.props as { children: React.ReactNode }).children;
        } else if (child.type === TableBody && tbodyChild == null) {
            tbodyChild = (child.props as { children: React.ReactNode }).children;
        }
    });

    let rows: React.ReactNode[] = [];
    if (tbodyChild) {
        rows = Children.toArray(tbodyChild);
    }

    const pagedTbodyChildren = rows.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div>
            <table>
                <thead>{theadChild}</thead>
                <tbody>{pagedTbodyChildren}</tbody>
            </table>
            <div>
                <div>
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span>{`${pageStart + 1}-${Math.min(pageStart + pageSize, data.length)} of ${data.length}`}</span>
                    <button
                        onClick={() =>
                            setPage((p) => Math.min(p + 1, maxPages))
                        }
                        disabled={page === maxPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
