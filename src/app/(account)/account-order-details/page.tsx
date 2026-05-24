import { Suspense } from 'react';
import CommanLayout from '@/components/CommanLayout';
import AccountOrderDetails from './_components/AccountOrderDetails';

export default function AccountOrderDetailsPage() {
    return (
        <CommanLayout>
            <Suspense fallback={<div className="container py-5 text-center">Loading order details...</div>}>
                <AccountOrderDetails />
            </Suspense>
        </CommanLayout>
    )
}