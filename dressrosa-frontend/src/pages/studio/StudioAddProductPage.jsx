import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, ImagePlus } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { SIZES, COLORS } from '../../utils/constants';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const StudioAddProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    status: 'IN_STOCK',
  });
  const [variants, setVariants] = useState([{ size: '', color: '', quantity: '' }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const setVariant = (index, field) => (e) => {
    const v = [...variants];
    v[index][field] = e.target.value;
    setVariants(v);
    if (errors[`variant_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`variant_${index}_${field}`]: '' }));
    }
  };

  const addVariant = () => setVariants([...variants, { size: '', color: '', quantity: '' }]);
  const removeVariant = (i) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, idx) => idx !== i));
      // Optionally clean up errors state for the removed variant indices, but since they'll be re-evaluated on submit, it's mostly fine
    }
  };

  const validate = () => {
    const newErrors = {};

    // Core validation
    if (!formData.title.trim()) newErrors.title = 'Product title is required.';
    if (!formData.description.trim()) newErrors.description = 'Product description is required.';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required.';
    if (!formData.categoryId) newErrors.categoryId = 'Category selection is required.';

    // Image Validation
    if (imageUrls.length === 0) newErrors.images = 'At least one product photo must be uploaded.';

    // Variant Validation
    if (variants.length === 0) {
      toast.error('You must have at least one variant.');
      newErrors.variants = 'Missing variant.';
    }

    variants.forEach((v, idx) => {
      if (!v.size) newErrors[`variant_${idx}_size`] = 'Size must be selected.';
      if (!v.quantity || parseInt(v.quantity) <= 0) newErrors[`variant_${idx}_quantity`] = 'Valid quantity is required.';
      // Color is optional, but constrained by the select options already
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the highlighted errors before publishing.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setLoading(true);
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        status: formData.status,
        imageUrls,
        variants: variants.map((v) => ({
          size: v.size || null,
          color: v.color || null,
          quantity: parseInt(v.quantity),
        })),
      };
      await productService.create(productData);
      toast.success('Product created!');
      navigate('/studio/products');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/studio/products')}
            className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-500">List a new piece in your Atelier catalog</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column — Main Info */}
            <div className="lg:col-span-2 space-y-5">

              {/* Basic Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Basic Information</h2>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={set('title')}
                    placeholder="e.g., Silk Evening Dress"
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.title ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 transition-all placeholder:text-gray-400`}
                  />
                  {errors.title && <span className="text-xs text-red-500 mt-1 block">{errors.title}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={set('description')}
                    rows={5}
                    placeholder="Describe the fabric, craftsmanship, occasion, and care instructions..."
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.description ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 transition-all placeholder:text-gray-400 resize-none`}
                  />
                  {errors.description && <span className="text-xs text-red-500 mt-1 block">{errors.description}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={set('price')}
                      placeholder="0.00"
                      className={`w-full px-4 py-3 bg-gray-50 border ${errors.price ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 transition-all placeholder:text-gray-400`}
                    />
                    {errors.price && <span className="text-xs text-red-500 mt-1 block">{errors.price}</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={set('categoryId')}
                      className={`w-full px-4 py-3 bg-gray-50 border ${errors.categoryId ? 'border-red-400' : 'border-gray-100'} rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 transition-all`}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <span className="text-xs text-red-500 mt-1 block">{errors.categoryId}</span>}
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Variants</h2>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-burgundy hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variant</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((variant, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Variant {i + 1}</p>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(i)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Size (Strict Predefined) */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            size <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={variant.size}
                            onChange={setVariant(i, 'size')}
                            className={`w-full px-3 py-2.5 bg-white border ${errors[`variant_${i}_size`] ? 'border-red-400' : 'border-gray-100'} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-burgundy/20 transition-all`}
                          >
                            <option value="">Select Size</option>
                            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {errors[`variant_${i}_size`] && <span className="text-[10px] text-red-500 mt-1 block">{errors[`variant_${i}_size`]}</span>}
                        </div>

                        {/* Color (Strict Predefined) */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            color
                          </label>
                          <select
                            value={variant.color}
                            onChange={setVariant(i, 'color')}
                            className="w-full px-3 py-2.5 bg-white border border-gray-100 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-burgundy/20 transition-all"
                          >
                            <option value="">No Color</option>
                            {COLORS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.quantity}
                            onChange={setVariant(i, 'quantity')}
                            placeholder="0"
                            className={`w-full px-3 py-2.5 bg-white border ${errors[`variant_${i}_quantity`] ? 'border-red-400' : 'border-gray-100'} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-burgundy/20 transition-all`}
                          />
                          {errors[`variant_${i}_quantity`] && <span className="text-[10px] text-red-500 mt-1 block">{errors[`variant_${i}_quantity`]}</span>}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className={`bg-white rounded-2xl border ${errors.images ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-100'} shadow-sm p-6 space-y-4 transition-all`}>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Product Photos <span className="text-red-500">*</span></h2>
                <p className="text-xs text-gray-400">Upload high-quality photos. First image will be the cover.</p>
                <ImageUpload images={imageUrls} onChange={(urls) => {
                  setImageUrls(urls);
                  if (urls.length > 0) setErrors(prev => ({...prev, images: ''}));
                }} />
                {errors.images && <span className="text-xs text-red-500 font-bold mt-2 block">{errors.images}</span>}
              </div>
            </div>

            {/* Right Column — Sidebar */}
            <div className="space-y-5">

              {/* Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Listing Status</h2>
                <div className="space-y-2">
                  {[
                    { val: 'IN_STOCK', label: 'Live — Visible to buyers', color: 'text-green-700' },
                    { val: 'SOLD_OUT', label: 'Sold Out — Not visible', color: 'text-red-600' },
                  ].map(({ val, label, color }) => (
                    <label key={val} className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.status === val
                        ? 'border-burgundy/30 bg-burgundy/5'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        value={val}
                        checked={formData.status === val}
                        onChange={set('status')}
                        className="accent-burgundy"
                      />
                      <span className={`text-sm font-bold ${color}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Publish */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Publish</h2>
                
                {Object.keys(errors).length > 0 && (
                   <div className="p-3 mb-2 bg-red-50 rounded-xl text-xs text-red-600 font-semibold border border-red-100/50">
                     There are validation errors that need your attention.
                   </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-burgundy text-white font-bold py-3 px-4 rounded-xl hover:bg-burgundy-dark transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/studio/products')}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudioAddProductPage;
