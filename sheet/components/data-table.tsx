"use client"
import React, { createContext, useContext, useState, Children, useEffect } from 'react';

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


export default function DataTable<T extends { id: number }>(
    {
        children
    }: {
        children: React.ReactNode;
    }
) {
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
    return (
        <div>
            <table>
                <thead>{theadChild}</thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
    );
}