'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Plus, Edit, Trash2, Home, Building, Map, Phone,
  Loader2, Check, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useStore, type Address } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const labelIcons: Record<string, React.ElementType> = {
  HOME: Home,
  OFFICE: Building,
  OTHER: Map,
}

const labelColors: Record<string, string> = {
  HOME: 'bg-blue-100 text-blue-600',
  OFFICE: 'bg-amber-100 text-amber-600',
  OTHER: 'bg-gray-100 text-gray-600',
}

interface AddressManagerProps {
  selectable?: boolean
  selectedAddressId?: string | null
  onSelectAddress?: (id: string) => void
}

export default function AddressManager({ selectable, selectedAddressId, onSelectAddress }: AddressManagerProps) {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [form, setForm] = useState({
    label: 'HOME' as 'HOME' | 'OFFICE' | 'OTHER',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  })

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const openAdd = () => {
    setEditingAddress(null)
    setForm({
      label: 'HOME', fullName: '', phone: '', addressLine1: '', addressLine2: '',
      city: '', state: '', pincode: '', landmark: '', isDefault: false,
    })
    setEditOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditingAddress(address)
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      isDefault: address.isDefault,
    })
    setEditOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses'
      const method = editingAddress ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast({ title: editingAddress ? 'Address updated' : 'Address added' })
        setEditOpen(false)
        fetchAddresses()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error saving address', variant: 'destructive' })
    }
  }

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Address deleted' })
        fetchAddresses()
      }
    } catch {
      toast({ title: 'Error deleting address', variant: 'destructive' })
    }
    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          Saved Addresses
        </h3>
        <Button onClick={openAdd} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-3 h-3 mr-1" /> Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No saved addresses</p>
          <Button onClick={openAdd} variant="outline" size="sm" className="mt-3">
            Add Your First Address
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {addresses.map((address, i) => {
              const Icon = labelIcons[address.label] || Map
              const isSelected = selectedAddressId === address.id
              return (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className={cn(
                      'border-0 shadow-sm cursor-pointer transition-all',
                      isSelected ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-md',
                      selectable && 'hover:bg-gray-50'
                    )}
                    onClick={() => selectable && onSelectAddress?.(address.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', labelColors[address.label])}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{address.fullName}</span>
                              <Badge variant="secondary" className="text-[10px]">{address.label}</Badge>
                              {address.isDefault && (
                                <Badge className="text-[10px] bg-green-100 text-green-700">Default</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              <Phone className="w-3 h-3 inline mr-1" />{address.phone}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                              {address.landmark && ` (${address.landmark})`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                        </div>

                        {!selectable && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); openEdit(address) }}
                              className="w-10 h-10 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {deleteConfirm === address.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); deleteAddress(address.id) }}
                                  className="w-10 h-10 p-0 text-red-500"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null) }}
                                  className="w-10 h-10 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(address.id) }}
                                className="w-10 h-10 p-0 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}

                        {selectable && isSelected && (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Select value={form.label} onValueChange={(v: any) => setForm({ ...form, label: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME">🏠 Home</SelectItem>
                  <SelectItem value="OFFICE">🏢 Office</SelectItem>
                  <SelectItem value="OTHER">📍 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required placeholder="Rahul Sharma" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+91 9876543210" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address Line 1</Label>
              <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} required placeholder="House no., Building, Street" />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} placeholder="Area, Colony" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required placeholder="Mumbai" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required placeholder="Maharashtra" />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required placeholder="400001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Landmark</Label>
              <Input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Near City Mall" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm">Set as default address</span>
            </label>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              {editingAddress ? 'Update Address' : 'Add Address'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
