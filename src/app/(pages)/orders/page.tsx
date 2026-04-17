"use client";

import { useEffect, useState } from "react";
import { apiServices } from "@/app/services/api";
import { useSession } from "next-auth/react";

export default function Orders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        // const userId = session?.user?.id;

        // if (!userId) return;

        // const data = await apiServices.getUserOrders(userId);
        // setOrders(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchOrders();
  }, [session]);

  return (
    <div>
      <div className="bg-green-400">
        <div className="px-30 mx-auto pt-32 pb-10">
          <div className="flex gap-3 items-center">
            <div className="bg-white text-green-600 p-4 text-2xl rounded-xl shadow-2xl">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <div>
              <h1 className="font-extrabold text-4xl text-white">All Orders</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-5 mb-5 px-30 text-gray-800 text-lg">
        {orders.length === 0 ? (
          <p className="text-center py-20">No orders found</p>
        ) : (
          orders.map((order: any) => (
            <div key={order._id}>
              <p>{order._id}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
