"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { apiServices } from "../../services/api";
import { getClientAuthToken } from "@/lib/auth-client";
import { IAddress } from "@/components/interfaces/IAddress";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [name, setName] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [removingAddressId, setRemovingAddressId] = useState<string | null>(
    null,
  );
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);

  function openAddressForm() {
    setShowAddressForm(true);
  }

  function closeAddressForm() {
    setShowAddressForm(false);
  }

  async function loadAddresses(resolvedToken: string | null) {
    if (!resolvedToken) {
      setAddresses([]);
      setIsFetchingAddresses(false);
      return;
    }

    try {
      setIsFetchingAddresses(true);
      const result = await apiServices.getLoggedUserAddresses(resolvedToken);
      setAddresses(result.data ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setIsFetchingAddresses(false);
    }
  }

  useEffect(() => {
    async function loadTokenAndAddresses() {
      const resolvedToken = await getClientAuthToken();
      setToken(resolvedToken);
      await loadAddresses(resolvedToken);
    }

    void loadTokenAndAddresses();
  }, [status]);

  async function handleAddAddress() {
    if (!token) {
      toast.error("Please sign in to add an address.");
      return;
    }

    if (!name.trim() || !details.trim() || !city.trim() || !phone.trim()) {
      toast.error("Please fill in all address fields.");
      return;
    }

    try {
      setIsAdding(true);
      await apiServices.addAddress(
        name.trim(),
        details.trim(),
        phone.trim(),
        city.trim(),
        token,
      );
      toast.success("Address added successfully.");
      setName("");
      setDetails("");
      setCity("");
      setPhone("");
      await loadAddresses(token);
      setShowAddressForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add address.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveAddress(addressId: string) {
    if (!token) {
      toast.error("Please sign in to remove an address.");
      return;
    }

    try {
      setRemovingAddressId(addressId);
      await apiServices.removeAddress(addressId, token);
      toast.success("Address removed successfully.");
      await loadAddresses(token);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove address.",
      );
    } finally {
      setRemovingAddressId(null);
    }
  }

  const hasAddresses = addresses.length > 0;

  return (
    <div>
      <div className="bg-green-400">
        <div className="px-30 mx-auto pt-32 pb-10">
          <div className="flex gap-3 items-center">
            <div className="bg-white text-green-600 p-4 text-2xl rounded-xl shadow-2xl">
              <i className="fa-solid fa-user"></i>
            </div>
            <div>
              <h1 className="font-extrabold text-4xl text-white">
                Profile Page
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-5 mb-5 px-30 text-gray-800 text-lg">
        <div className="flex items-center gap-2">
          <p className="font-bold text-xl">Name:</p>
          <p>{session?.user?.name ?? "Guest"}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-bold text-xl">Email:</p>
          <p>{session?.user?.email ?? "Not signed in"}</p>
        </div>
        <div className="mt-2">
          <div className="mt-3 flex justify-between items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">My Addresses</h1>
            <button
              type="button"
              className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              onClick={openAddressForm}
              disabled={status === "loading" || !token}
            >
              Add Address
            </button>
          </div>
          {showAddressForm && (
            <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm my-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Address Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Home, Office, etc."
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-900">
                  Address Details
                </label>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Street, building, landmark"
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    City
                  </label>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Cairo"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    Phone
                  </label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="010XXXXXXXX"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  onClick={handleAddAddress}
                  disabled={
                    isAdding ||
                    removingAddressId !== null ||
                    status === "loading" ||
                    !token
                  }
                >
                  {isAdding ? <Loader2 className="animate-spin" /> : null}
                  {isAdding ? "Adding..." : "Save Address"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
                  onClick={closeAddressForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="text-slate-500">
            {hasAddresses
              ? "Your saved shipping address is shown below."
              : "Add your shipping address to proceed with checkout."}
          </div>

          {isFetchingAddresses ? (
            <div className="mt-3 text-slate-500">Loading address...</div>
          ) : hasAddresses ? (
            <div className="mt-3 grid gap-4">
              {addresses.map((address) => (
                <div
                  key={
                    address._id ??
                    `${address.name}-${address.city}-${address.phone}`
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {address.name ?? "Saved Address"}
                      </p>
                      <p className="mt-2 text-slate-600">{address.details}</p>
                      <p className="mt-2 text-slate-600">{address.city}</p>
                      <p className="mt-2 text-slate-600">{address.phone}</p>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                      onClick={() => handleRemoveAddress(address._id ?? "")}
                      disabled={
                        isAdding ||
                        removingAddressId !== null ||
                        status === "loading" ||
                        !token
                      }
                    >
                      {removingAddressId === address._id ? (
                        <Loader2 className="animate-spin" />
                      ) : null}
                      {removingAddressId === address._id
                        ? "Removing..."
                        : "Remove Address"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6" />
          )}
        </div>
      </div>
    </div>
  );
}
