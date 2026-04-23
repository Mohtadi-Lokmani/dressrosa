import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    status: 'IN_STOCK',
  });
  const [variants, setVariants] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await productService.getById(id);
      
      setFormData({
        title: product.title,
        description: product.description || '',
        price: product.price.toString(),
        categoryId: product.category?.categoryId?.toString() || '',
        status: product.status,
      });

      setVariants(
        product.variants?.length > 0
          ? product.variants.map(v => ({
              variantId: v.variantId,
              size: v.size || '',
              color: v.color || '',
              quantity: v.quantity?.toString() || '',
            }))
          : [{ size: '', color: '', quantity: '' }]
      );

      setImageUrls(product.imageUrls || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', quantity: '' }]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (variants.some(v => !v.quantity || parseInt(v.quantity) <= 0)) {
      toast.error('All variants must have a quantity');
      return;
    }

    try {
      setSaving(true);

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        status: formData.status,
        imageUrls: imageUrls,
        variants: variants.map(v => ({
          variantId: v.variantId || null,
          size: v.size || null,
          color: v.color || null,
          quantity: parseInt(v.quantity),
        })),
      };

      await productService.update(id, productData);
      toast.success('Product updated successfully!');
      navigate('/seller/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading product..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/seller/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

                <Input
                  label="Product Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter product title"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Describe your product..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="SOLD_OUT">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={addVariant}
                  >
                    Add Variant
                  </Button>
                </div>

                {variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Variant {index + 1}</h3>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Size"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        placeholder="e.g., M, L, XL"
                      />
                      <Input
                        label="Color"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        placeholder="e.g., Red, Blue"
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        min="0"
                        value={variant.quantity}
                        onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Images */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
                <ImageUpload images={imageUrls} onChange={setImageUrls} />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/seller/products')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EditProductPage;