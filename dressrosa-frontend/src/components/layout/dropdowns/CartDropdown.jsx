import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import { formatPrice } from '../../../utils/formatters';
import toast from 'react-hot-toast';

const CartDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { cart, loading, fetchCart, updateQuantity, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 p-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const total = getTotal();

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Shopping Cart ({items.length})
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Items */}
      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Add some products to get started!"
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.cartItemId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product?.productId}`}
                    onClick={onClose}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.product?.media?.[0]?.url || 'https://via.placeholder.com/80'}
                      alt={item.product?.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?.productId}`}
                      onClick={onClose}
                      className="block"
                    >
                      <h4 className="font-medium text-gray-900 line-clamp-2 hover:text-burgundy transition-colors">
                        {item.product?.title}
                      </h4>
                    </Link>
                    
                    {/* Variant Info */}
                    {item.variant && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.size && item.variant.color && ' • '}
                        {item.variant.color && `Color: ${item.variant.color}`}
                      </p>
                    )}

                    <p className="text-sm font-semibold text-burgundy mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:border-burgundy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        disabled={item.quantity >= (item.variant?.quantity || 999)}
                        className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:border-burgundy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.cartItemId)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Subtotal */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="primary"
              fullWidth
              onClick={handleCheckout}
            >
              Checkout
            </Button>
            <Link
              to="/shop"
              onClick={onClose}
              className="block text-center text-sm text-burgundy hover:text-burgundy-dark font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;