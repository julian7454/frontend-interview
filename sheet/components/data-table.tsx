"use client"
import React, { createContext, useContext, Children } from 'react';

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

export function TableFoot({ children }: { children: React.ReactNode }) {
    return (
        <tfoot>
            {children}
        </tfoot>
    );
}

export function TableRow({ children }: { children: React.ReactNode }) {
    return <tr>{children}</tr>;
}

export function TableCell({ children, colSpan = 1 }: { children: React.ReactNode, colSpan?: number }) {
    const section = useContext(TableSectionContext);

    if (section === 'head') {
        return <th colSpan={colSpan}
            className="relative after:border after:border-transparent nth-1:after:border-r-transparent
            nth-last-1:after:border-r-transparent  after:border-r-gray-400 after:absolute after:right-0 after:mt-1 after:h-4 py-4 px-4">
            {children}
        </th>;
    }
    return <td colSpan={colSpan} className="py-2 px-4 text-center border border-transparent border-b-gray-300">{children}</td>;
}


export default function DataTable(
    {
        children,
        caption,
    }: {
        children: React.ReactNode;
        caption?: React.ReactNode;
    }
) {
    let theadChild: React.ReactNode = null;
    let tbodyChild: React.ReactNode = null;
    let tfootChild: React.ReactNode = null;
    Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        if (child.type === TableHead && theadChild == null) {
            theadChild = child;
        } else if (child.type === TableBody && tbodyChild == null) {
            tbodyChild = child;
        } else if (child.type === TableFoot && tfootChild == null) {
            tfootChild = child;
        }
    });

    return (
        <div>
            <table className="bg-white w-full shadow-md">
                {caption && (
                    <caption className="caption-bottom text-red-600 text-center font-semibold py-2">
                        {caption}
                    </caption>
                )}
                <thead className="bg-background">{theadChild}</thead>
                <tbody>{tbodyChild}</tbody>
                {tfootChild}
            </table>
        </div>
    );
}
