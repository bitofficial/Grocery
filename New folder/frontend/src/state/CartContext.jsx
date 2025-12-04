import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty }
        return copy
      }
      return [...prev, { ...product, qty }]
    })
  }

  const removeItem = id => setItems(prev => prev.filter(i => i.id !== id))
  const clear = () => setItems([])
  const updateQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i).filter(i => i.qty > 0))
  const increment = id => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))
  const decrement = id => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0))

  const total = useMemo(() => items.reduce((sum, i) => sum + i.product_price * i.qty, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total, updateQty, increment, decrement }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
