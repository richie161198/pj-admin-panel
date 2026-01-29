import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddProductMutation, useUpdateProductMutation, useGetProductByIdQuery, useGetAllCategoriesQuery } from '@/store/api/product/productApi';
import { useUploadMultipleImagesMutation, useUploadSingleImageMutation } from '@/store/api/image/imageApi';
import { useGetInvestmentSettingsQuery } from '@/store/api/utils/utilsApi';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import Card from '@/components/ui/Card';

// Component for managing product detail attributes dynamically
const ProductDetailItem = ({ detail, index, onUpdateDetail, onRemove }) => {
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const handleTypeChange = (value) => {
    onUpdateDetail({ ...detail, type: value });
  };

  const handleAttributeChange = (key, value) => {
    const updatedAttributes = { ...detail.attributes, [key]: value };
    onUpdateDetail({ ...detail, attributes: updatedAttributes });
  };

  const addAttribute = () => {
    if (newAttrKey.trim()) {
      const updatedAttributes = { ...detail.attributes, [newAttrKey]: newAttrValue };
      onUpdateDetail({ ...detail, attributes: updatedAttributes });
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  const removeAttribute = (key) => {
    const updatedAttributes = { ...detail.attributes };
    delete updatedAttributes[key];
    onUpdateDetail({ ...detail, attributes: updatedAttributes });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type (e.g., Metal, Stone)
        </label>
        <input
          type="text"
          value={detail.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          placeholder="e.g., Metal, Stone"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Attributes
          </label>
          <span className="text-xs text-gray-500">
            {Object.keys(detail.attributes || {}).length} attributes
          </span>
        </div>
        
        {/* Display existing attributes */}
        <div className="space-y-2 mb-3">
          {Object.entries(detail.attributes || {}).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-800 p-2 rounded">
              <input
                type="text"
                value={key}
                readOnly
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-slate-700 dark:text-white"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => removeAttribute(key)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Icon icon="ph:x" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new attribute */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newAttrKey}
            onChange={(e) => setNewAttrKey(e.target.value)}
            placeholder="Attribute name (e.g., karatage, name)"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
          <input
            type="text"
            value={newAttrValue}
            onChange={(e) => setNewAttrValue(e.target.value)}
            placeholder="Value"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
          <button
            type="button"
            onClick={addAttribute}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Icon icon="ph:plus" />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onRemove}
          className="btn btn-sm btn-outline-danger"
        >
          <Icon icon="ph:trash" className="mr-2" />
          Remove Detail
        </Button>
      </div>
    </div>
  );
};

const ProductAdd = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    active: true,
    stock: 0,
    CurrentlyNotavaiable: false,
    categories: '',
    popular: false,
    trending: false,
    categoryId: '',
    skuId: '',
    rating: {
      value: 0,
      count: 0
    },
    selectedCaret: '',
    metalType: 'gold', // 'gold' or 'silver'
    productDetails: [],
    priceDetails: [],
    subtotal: {
      weight: ''
    },
    Discount: 0,
    isDiscountAvaiable: false,
    gst: 0,
    images: [],
    // Return & Replacement Policy
    isReturnAllowed: true,
    isReplacementAllowed: true,
    returnReplacementDays: 5
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const isCalculatingRef = useRef(false);

  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadMultipleImages, { isLoading: isUploadingImage }] = useUploadMultipleImagesMutation();
  const [uploadSingleImage] = useUploadSingleImageMutation();
  const { data: productResponse, isLoading: isLoadingProduct, error: productError } = useGetProductByIdQuery(id, { skip: !isEdit });
  const { data: categoriesResponse } = useGetAllCategoriesQuery();
  const { data: investmentSettingsData } = useGetInvestmentSettingsQuery();

  // Extract categories from API response - handle all possible response structures
  const categories = React.useMemo(() => {
    if (!categoriesResponse) return [];
    
    // RTK Query wraps response in 'data', so check categoriesResponse.data first
    if (categoriesResponse.data) {
      // Backend returns: { status: true, count: X, categories: [...] }
      if (Array.isArray(categoriesResponse.data.categories)) {
        return categoriesResponse.data.categories;
      }
      // If data itself is an array
      if (Array.isArray(categoriesResponse.data)) {
        return categoriesResponse.data;
      }
    }
    
    // Direct categories array
    if (Array.isArray(categoriesResponse.categories)) {
      return categoriesResponse.categories;
    }
    
    // Direct array response
    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }
    
    return [];
  }, [categoriesResponse]);
  
  // Get current metal prices from investment settings
  const investmentSettings = investmentSettingsData?.data;
  const goldPrice24kt = investmentSettings?.goldPrice24kt || investmentSettings?.goldPrice || 0;
  const goldPrice22kt = investmentSettings?.goldPrice22kt || 0;
  const goldPrice18kt = investmentSettings?.goldPrice18kt || 0;
  const silverPrice = investmentSettings?.silverPrice || 0;
  const silverPrice925 = investmentSettings?.silverRate925 || 0;

  // Extract product from API response - handle different response structures
  const product = React.useMemo(() => {
    if (!productResponse) return null;
    
    // Handle different possible response structures
    if (productResponse?.products && Array.isArray(productResponse.products)) {
      return productResponse.products[0]; // If it's an array, take the first item
    } else if (productResponse?.product) {
      return productResponse.product; // If it's a single product object
    } else if (productResponse?.data) {
      return productResponse.data; // If it's nested in data
    } else if (productResponse && typeof productResponse === 'object') {
      return productResponse; // If the response is the product itself
    }
    return null;
  }, [productResponse]);

  // Debug logging
  useEffect(() => {
    if (isEdit) {
      console.log('Edit Mode Debug:', {
        id,
        isLoadingProduct,
        productError,
        productResponse,
        extractedProduct: product
      });
    }
  }, [isEdit, id, isLoadingProduct, productError, productResponse, product]);

  useEffect(() => {
    if (isEdit && product) {
      console.log('Prefilling form with product data:', product);
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        active: product.active ?? true,
        stock: product.stock || 0,
        CurrentlyNotavaiable: product.CurrentlyNotavaiable || false,
        categories: product.categories || '',
        popular: product.popular || false,
        trending: product.trending || false,
        categoryId: product.categoryId || '',
        skuId: product.skuId || '',
        rating: product.rating || { value: 0, count: 0 },
        selectedCaret: product.selectedCaret || '',
        metalType: product.metalType || (product.selectedCaret?.toLowerCase().includes('silver') ? 'silver' : 'gold'),
        productDetails: product.productDetails || [],
        priceDetails: (product.priceDetails || []).map(detail => ({
          name: detail.name || '',
          weight: detail.weight || '',
          value: typeof detail.value === 'number' ? detail.value : parseFloat(detail.value || 0)
        })),
        subtotal: product.subtotal || { weight: '' },
        Discount: product.Discount || 0,
        isDiscountAvaiable: product.isDiscountAvaiable || false,
        gst: product.gst || 0,
        images: product.images || [],
        // Return & Replacement Policy
        isReturnAllowed: product.isReturnAllowed !== undefined ? product.isReturnAllowed : true,
        isReplacementAllowed: product.isReplacementAllowed !== undefined ? product.isReplacementAllowed : true,
        returnReplacementDays: product.returnReplacementDays !== undefined ? product.returnReplacementDays : 5
      });
      setUploadedImages(product.images || []);
    }
  }, [isEdit, product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => {
        const updated = {
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        };
        
        // Reset selectedCaret when metal type changes
        if (name === 'metalType') {
          updated.selectedCaret = '';
        }
        
        return updated;
      });
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file sizes (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed 5MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      e.target.value = ''; // Reset input
      return;
    }

    console.log('Files selected:', files.length, files);
    setIsUploading(true);

    try {
      // Try multiple images upload first
      try {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`images`, file);
        });
        
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        const response = await uploadMultipleImages(formData).unwrap();
        console.log('Multiple upload response:', response);
        
        // Handle different response formats
        let imageUrls = [];
        
        if (response.urls && Array.isArray(response.urls)) {
          imageUrls = response.urls;
        } else if (response.data && Array.isArray(response.data)) {
          imageUrls = response.data;
        } else if (response.images && Array.isArray(response.images)) {
          imageUrls = response.images;
        } else if (Array.isArray(response)) {
          imageUrls = response;
        } else if (response.url) {
          imageUrls = [response.url];
        } else {
          throw new Error('Unexpected response format from multiple upload');
        }
        
        if (imageUrls.length > 0) {
          // Extract URLs from objects if they have url property
          const extractedUrls = imageUrls.map(img => {
            if (typeof img === 'string') {
              return img;
            } else if (img && img.url) {
              return img.url;
            }
            return img;
          });
          
          setUploadedImages(prev => [...prev, ...extractedUrls]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...extractedUrls]
          }));
          
          toast.success(`${extractedUrls.length} file(s) uploaded successfully`);
          return;
        }
      } catch (multipleError) {
        console.log('Multiple upload failed, trying single uploads:', multipleError);
        
        // Fallback to single image uploads
        const uploadedUrls = [];
        for (const file of files) {
          try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await uploadSingleImage(formData).unwrap();
            console.log('Single upload response:', response);
            
            if (response.url) {
              uploadedUrls.push(response.url);
            } else if (response.data && response.data.url) {
              uploadedUrls.push(response.data.url);
            } else if (response.imageUrl) {
              uploadedUrls.push(response.imageUrl);
            } else if (response.data && typeof response.data === 'string') {
              uploadedUrls.push(response.data);
            }
          } catch (singleError) {
            console.error(`Failed to upload ${file.name}:`, singleError);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
        
        if (uploadedUrls.length > 0) {
          setUploadedImages(prev => [...prev, ...uploadedUrls]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
          }));
          
          toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
        } else {
          toast.error('Failed to upload any files');
        }
      }
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Add handlers for dynamic fields
  const addProductDetail = () => {
    setFormData(prev => ({
      ...prev,
      productDetails: [...prev.productDetails, { type: '', attributes: {} }]
    }));
  };

  const removeProductDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      productDetails: prev.productDetails.filter((_, i) => i !== index)
    }));
  };

  const addPriceDetail = () => {
    setFormData(prev => ({
      ...prev,
      priceDetails: [...prev.priceDetails, { name: '', weight: '', value: '' }]
    }));
  };

  const removePriceDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      priceDetails: prev.priceDetails.filter((_, i) => i !== index)
    }));
  };

  // Calculate metal price based on type, karat, and weight
  const getMetalPrice = (metalType, selectedCaret, weight) => {
    if (!weight || weight === '') return 0;
    
    // Extract weight number (remove 'g', 'gm', etc.)
    const weightNum = parseFloat(weight.toString().replace(/[^\d.]/g, '')) || 0;
    if (weightNum === 0) return 0;

    if (metalType === 'gold') {
      let pricePerGram = 0;
      if (selectedCaret === '24K') {
        pricePerGram = goldPrice24kt;
      } else if (selectedCaret === '22K') {
        pricePerGram = goldPrice22kt || (goldPrice24kt * 0.916);
      } else if (selectedCaret === '18K') {
        pricePerGram = goldPrice18kt || (goldPrice24kt * 0.75);
      }
      return pricePerGram * weightNum;
    } else if (metalType === 'silver') {
      let pricePerGram = 0;
      if (selectedCaret === 'Pure Silver 999') {
        pricePerGram = silverPrice;
      } else if (selectedCaret === 'Silver 925') {
        pricePerGram = silverPrice925 || (silverPrice * 0.925);
      }
      return pricePerGram * weightNum;
    }
    return 0;
  };

  // Function to recalculate price details
  const recalculatePriceDetails = useCallback((currentFormData) => {
    if (!currentFormData.metalType || !currentFormData.selectedCaret || !investmentSettings) return null;
    if (isCalculatingRef.current) return null; // Prevent recursive calls

    isCalculatingRef.current = true;
    // Create a deep copy of priceDetails to avoid mutating frozen objects from API
    const priceDetails = currentFormData.priceDetails.map(detail => ({
      name: detail.name || '',
      weight: detail.weight || '',
      value: typeof detail.value === 'number' ? detail.value : parseFloat(detail.value || 0)
    }));
    let metalIndex = -1;
    let metalDetail = null;

    // Find or create metal entry
    const metalName = currentFormData.metalType === 'gold' ? 'Gold' : 'Silver';
    metalIndex = priceDetails.findIndex(d => 
      d.name?.toLowerCase().includes(metalName.toLowerCase())
    );

    if (metalIndex === -1) {
      // Create new metal entry if not found
      priceDetails.push({ name: metalName, weight: '', value: 0 });
      metalIndex = priceDetails.length - 1;
    }

    // Create a new object instead of mutating the existing one
    metalDetail = { 
      name: priceDetails[metalIndex].name || metalName,
      weight: priceDetails[metalIndex].weight || '',
      value: typeof priceDetails[metalIndex].value === 'number' ? priceDetails[metalIndex].value : parseFloat(priceDetails[metalIndex].value || 0)
    };
    
    // Update metal name if it doesn't match
    if (!metalDetail.name?.toLowerCase().includes(metalName.toLowerCase())) {
      metalDetail.name = metalName;
    }

    // Calculate metal value if weight is provided
    if (metalDetail.weight) {
      const metalValue = getMetalPrice(currentFormData.metalType, currentFormData.selectedCaret, metalDetail.weight);
      metalDetail.value = parseFloat(metalValue.toFixed(2));
    } else {
      // If no weight, use existing value or 0
      metalDetail.value = parseFloat(metalDetail.value || 0);
    }
    
    // Update the priceDetails array with the new metalDetail object
    priceDetails[metalIndex] = metalDetail;

    // Calculate stones total (preserve existing stone entries)
    let stonesTotal = 0;
    const stoneEntries = [];
    priceDetails.forEach((detail, index) => {
      if (index !== metalIndex) {
        const name = detail.name?.toLowerCase() || '';
        if (name.includes('stone') || name.includes('diamond') || name.includes('ruby') || 
            name.includes('emerald') || name.includes('sapphire') || name.includes('pearl')) {
          stonesTotal += parseFloat(detail.value || 0);
          stoneEntries.push(detail);
        }
      }
    });

    // Calculate metal total
    const metalTotal = parseFloat(metalDetail.value || 0);

    // Calculate making charges (percentage of metal + stones)
    let makingChargesIndex = priceDetails.findIndex(d => 
      d.name?.toLowerCase().includes('making charges')
    );
    
    let makingChargesPct = 0;
    if (makingChargesIndex >= 0) {
      const makingChargesWeight = priceDetails[makingChargesIndex].weight?.toString() || '';
      makingChargesPct = parseFloat(makingChargesWeight.replace(/[^\d.]/g, '')) || 0;
    }

    const baseTotal = metalTotal + stonesTotal;
    const makingChargesAmount = (baseTotal * makingChargesPct) / 100;

    // Step 1: Calculate Subtotal = Metal + Stones + Making Charges
    const subtotal = baseTotal + makingChargesAmount;

    // Step 2: Calculate Discount from Subtotal (if discount percentage is entered)
    const discountPct = currentFormData.Discount || 0;
    const discountAmount = (subtotal * discountPct) / 100; // Discount calculated from subtotal
    
    // Step 3: Calculate Subtotal After Discount
    const subtotalAfterDiscount = subtotal - discountAmount;

    // Step 4: Calculate GST from Subtotal After Discount (if GST percentage is entered)
    const gstPct = currentFormData.gst || 0;
    const gstAmount = (subtotalAfterDiscount * gstPct) / 100; // GST calculated from subtotal after discount

    // Step 5: Calculate Final Grand Total = Subtotal After Discount + GST
    const finalTotal = subtotalAfterDiscount + gstAmount;

    // Rebuild price details: keep metal, stones, and making charges; remove and re-add system entries
    const entriesToRemove = ['sub total', 'subtotal', 'discount', 'gst', 'grand total', 'final price', 'total'];
    const filteredDetails = priceDetails.filter((detail, index) => {
      if (index === metalIndex) return true; // Keep metal
      const name = detail.name?.toLowerCase() || '';
      if (name.includes('making charges')) return true; // Keep making charges
      if (name.includes('stone') || name.includes('diamond') || name.includes('ruby') || 
          name.includes('emerald') || name.includes('sapphire') || name.includes('pearl')) {
        return true; // Keep stones
      }
      // Remove system entries (will be re-added)
      return !entriesToRemove.some(entry => name.includes(entry));
    });

    // Update making charges value
    if (makingChargesIndex >= 0) {
      const filteredMakingChargesIndex = filteredDetails.findIndex(d => 
        d.name?.toLowerCase().includes('making charges')
      );
      if (filteredMakingChargesIndex >= 0) {
        filteredDetails[filteredMakingChargesIndex].value = parseFloat(makingChargesAmount.toFixed(2));
      }
    } else if (makingChargesPct > 0) {
      // Add making charges if percentage is set but entry doesn't exist
      filteredDetails.push({
        name: 'Making Charges',
        weight: `${makingChargesPct}%`,
        value: parseFloat(makingChargesAmount.toFixed(2))
      });
    }

    // Add system entries in order
    const newPriceDetails = [...filteredDetails];
    const metalWeight = (metalDetail.weight || '').toString().replace(/[^\d.]/g, '');
    const weightDisplay = metalWeight ? `${metalWeight}g Gross Wt.` : 'Gross Wt.';
    
    // Always show Sub Total
    newPriceDetails.push({ 
      name: 'Sub Total', 
      weight: weightDisplay, 
      value: parseFloat(subtotal.toFixed(2)) 
    });
    
    // Show Discount if discount percentage is entered (even if amount is 0, show it)
    if (discountPct > 0) {
      newPriceDetails.push({ 
        name: 'Discount', 
        weight: `${discountPct}%`, 
        value: parseFloat(discountAmount.toFixed(2)) 
      });
    }
    
    // Always show Sub Total After Discount
    newPriceDetails.push({ 
      name: 'Sub Total After Discount', 
      weight: 'After discount', 
      value: parseFloat(subtotalAfterDiscount.toFixed(2)) 
    });
    
    // Always show GST (even if 0 or percentage is 0)
    newPriceDetails.push({ 
      name: 'GST', 
      weight: `${gstPct}%`, 
      value: parseFloat(gstAmount.toFixed(2)) 
    });
    
    // Always show Grand Total (final value)
    newPriceDetails.push({ 
      name: 'Grand Total', 
      weight: 'Final Price', 
      value: parseFloat(finalTotal.toFixed(2)) 
    });

    isCalculatingRef.current = false;
    return newPriceDetails;
  }, [formData.metalType, formData.selectedCaret, formData.Discount, formData.gst, goldPrice24kt, goldPrice22kt, goldPrice18kt, silverPrice, silverPrice925, investmentSettings]);

  // Auto-calculate when relevant fields change
  useEffect(() => {
    // Allow recalculation even if metal type/karat not set, if Discount or GST is being entered
    if (!investmentSettings) return;
    if (isCalculatingRef.current) return;
    
    // If Discount or GST is being changed, recalculate even without metal selection
    if (formData.Discount > 0 || formData.gst > 0) {
      // Still need metal type and karat for proper calculation, but allow partial updates
      if (!formData.metalType || !formData.selectedCaret) {
        // If no metal selected, still try to recalculate with existing price details
        const existingSubtotal = formData.priceDetails.find(d => 
          d.name?.toLowerCase().includes('sub total') && !d.name?.toLowerCase().includes('after')
        );
        if (existingSubtotal) {
          const subtotal = parseFloat(existingSubtotal.value || 0);
          const discountPct = formData.Discount || 0;
          const discountAmount = (subtotal * discountPct) / 100;
          const subtotalAfterDiscount = subtotal - discountAmount;
          const gstPct = formData.gst || 0;
          const gstAmount = (subtotalAfterDiscount * gstPct) / 100;
          const finalTotal = subtotalAfterDiscount + gstAmount;
          
          // Update only discount, GST, and totals
          const newPriceDetails = formData.priceDetails.map(detail => {
            const name = detail.name?.toLowerCase() || '';
            if (name.includes('discount')) {
              return { ...detail, weight: `${discountPct}%`, value: parseFloat(discountAmount.toFixed(2)) };
            }
            if (name.includes('sub total after discount')) {
              return { ...detail, value: parseFloat(subtotalAfterDiscount.toFixed(2)) };
            }
            if (name.includes('gst') && !name.includes('cgst') && !name.includes('sgst')) {
              return { ...detail, weight: `${gstPct}%`, value: parseFloat(gstAmount.toFixed(2)) };
            }
            if (name.includes('grand total')) {
              return { ...detail, value: parseFloat(finalTotal.toFixed(2)) };
            }
            return detail;
          });
          
          // Add missing entries if they don't exist
          if (!newPriceDetails.find(d => d.name?.toLowerCase().includes('discount')) && discountPct > 0) {
            const subtotalIndex = newPriceDetails.findIndex(d => 
              d.name?.toLowerCase().includes('sub total') && !d.name?.toLowerCase().includes('after')
            );
            if (subtotalIndex >= 0) {
              newPriceDetails.splice(subtotalIndex + 1, 0, {
                name: 'Discount',
                weight: `${discountPct}%`,
                value: parseFloat(discountAmount.toFixed(2))
              });
            }
          }
          
          setFormData(prev => ({ ...prev, priceDetails: newPriceDetails }));
          return;
        }
      }
    }
    
    // Full recalculation when metal type and karat are set
    if (!formData.metalType || !formData.selectedCaret) return;
    
    const newPriceDetails = recalculatePriceDetails(formData);
    if (newPriceDetails) {
      // Check if metal entry has weight before updating
      const metalName = formData.metalType === 'gold' ? 'Gold' : 'Silver';
      const metalEntry = formData.priceDetails.find(d => 
        d.name?.toLowerCase().includes(metalName.toLowerCase())
      );
      
      // Always update if:
      // 1. Metal has weight (for initial calculation)
      // 2. Discount or GST changed (for recalculation)
      // 3. Length changed (new entries added)
      const shouldUpdate = metalEntry?.weight || 
                          newPriceDetails.length !== formData.priceDetails.length ||
                          formData.Discount > 0 || 
                          formData.gst > 0;
      
      if (shouldUpdate) {
        setFormData(prev => ({
          ...prev,
          priceDetails: newPriceDetails
        }));
      }
    }
  }, [formData.metalType, formData.selectedCaret, formData.Discount, formData.gst, goldPrice24kt, goldPrice22kt, goldPrice18kt, silverPrice, silverPrice925, investmentSettings, recalculatePriceDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        stock: parseInt(formData.stock) || 0,
        rating: {
          value: parseFloat(formData.rating.value) || 0,
          count: parseInt(formData.rating.count) || 0
        },
        subtotal: {
          weight: formData.subtotal.weight
        },
        Discount: parseFloat(formData.Discount) || 0,
        gst: parseFloat(formData.gst) || 0
      };
      
      console.log('Submitting product data:', submitData);
      console.log('Images array:', submitData.images);
      
      // Ensure all images are strings
      submitData.images = submitData.images.map(img => {
        if (typeof img === 'string') {
          return img;
        } else if (img && img.url) {
          return img.url;
        }
        return String(img);
      });
      
      console.log('Processed images:', submitData.images);

      if (isEdit) {
        await updateProduct({ id, ...submitData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await addProduct(submitData).unwrap();
        toast.success('Product added successfully');
      }
      
      navigate('/products');
    } catch (error) {
      console.log('Submit error:', error);
      toast.error(error.data?.message || 'Failed to save product');
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (isEdit && productError) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Icon icon="ph:warning-circle" className="text-4xl text-red-500 mb-4" />
        <p className="text-red-500 text-lg mb-2">Failed to load product</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{productError?.data?.message || 'Product not found'}</p>
        <Button onClick={() => navigate('/products')} className="btn btn-outline">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  if (isEdit && !product) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Icon icon="ph:magnifying-glass" className="text-4xl text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">Product not found</p>
        <Button onClick={() => navigate('/products')} className="btn btn-outline">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update product information' : 'Create a new product'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/products')}
          className="btn btn-outline"
        >
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card title="Product Information">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU ID *
                  </label>
                  <input
                    type="text"
                    name="skuId"
                    value={formData.skuId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="categories"
                    value={formData.categories}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                        categories: categories.find(c => c._id === e.target.value)?.name || ''
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Category Id</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Status and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="CurrentlyNotavaiable"
                      checked={formData.CurrentlyNotavaiable}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Currently Not Available
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={formData.popular}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Popular
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="trending"
                      checked={formData.trending}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Trending
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating Value
                    </label>
                    <input
                      type="number"
                      name="rating.value"
                      value={formData.rating.value}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating Count
                    </label>
                    <input
                      type="number"
                      name="rating.count"
                      value={formData.rating.count}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Return & Replacement Policy */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                {/* <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Icon icon="ph:arrow-counter-clockwise" className="mr-2 text-purple-500" />
                  Return & Replacement Policy
                </h3> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isReturnAllowed"
                      checked={formData.isReturnAllowed}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Allow Return
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isReplacementAllowed"
                      checked={formData.isReplacementAllowed}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Allow Replacement
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Days Allowed
                    </label>
                    <input
                      type="number"
                      name="returnReplacementDays"
                      value={formData.returnReplacementDays}
                      onChange={handleInputChange}
                      min="0"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Days from delivery for return/replacement
                    </p>
                  </div>
                </div>
              </div>

              {/* Metal Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Metal Type
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="metalType"
                      value="gold"
                      checked={formData.metalType === 'gold'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Icon icon="ph:medal" className="text-yellow-500 mr-1" />
                      Gold
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="metalType"
                      value="silver"
                      checked={formData.metalType === 'silver'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-gray-400 focus:ring-gray-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Icon icon="ph:medal" className="text-gray-400 mr-1" />
                      Silver
                    </span>
                  </label>
                </div>
              </div>

              {/* Karat/Purity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.metalType === 'gold' ? 'Gold Karat' : 'Silver Purity'}
                </label>
                {formData.metalType === 'gold' ? (
                  <select
                    name="selectedCaret"
                    value={formData.selectedCaret}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Karat</option>
                    <option value="24K">24 Karat (Pure Gold - 99.9%)</option>
                    <option value="22K">22 Karat (91.67%)</option>
                    <option value="18K">18 Karat (75%)</option>
                  </select>
                ) : (
                  <select
                    name="selectedCaret"
                    value={formData.selectedCaret}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Purity</option>
                    <option value="Pure Silver 999">Pure Silver 999 (99.9%)</option>
                    <option value="Silver 925">Silver 925 (92.5% - Sterling Silver)</option>
                  </select>
                )}
              </div>

              {/* Pricing Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing & Discount</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subtotal Weight
                    </label>
                    <input
                      type="text"
                      name="subtotal.weight"
                      value={formData.subtotal.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.96g"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="Discount"
                      value={formData.Discount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData(prev => {
                          const updated = { ...prev, Discount: value };
                          // Trigger immediate recalculation
                          setTimeout(() => {
                            const recalculated = recalculatePriceDetails(updated);
                            if (recalculated) {
                              setFormData(prevState => ({ ...prevState, priceDetails: recalculated }));
                            }
                          }, 0);
                          return updated;
                        });
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GST (%)
                    </label>
                    <input
                      type="number"
                      name="gst"
                      value={formData.gst}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData(prev => {
                          const updated = { ...prev, gst: value };
                          // Trigger immediate recalculation
                          setTimeout(() => {
                            const recalculated = recalculatePriceDetails(updated);
                            if (recalculated) {
                              setFormData(prevState => ({ ...prevState, priceDetails: recalculated }));
                            }
                          }, 0);
                          return updated;
                        });
                      }}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDiscountAvaiable"
                      checked={formData.isDiscountAvaiable}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Discount Available
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Details</h3>
                  <Button
                    type="button"
                    onClick={addProductDetail}
                    className="btn btn-sm btn-outline"
                  >
                    <Icon icon="ph:plus" className="mr-2" />
                    Add Product Detail
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.productDetails.map((detail, index) => (
                    <ProductDetailItem
                      key={index}
                      detail={detail}
                      index={index}
                      onUpdateDetail={(updatedDetail) => {
                        const newDetails = [...formData.productDetails];
                        newDetails[index] = updatedDetail;
                        setFormData(prev => ({ ...prev, productDetails: newDetails }));
                      }}
                      onRemove={() => removeProductDetail(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Price Details */}
              <div>
                {/* Information Note */}
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start">
                    <Icon icon="heroicons-outline:information-circle" className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-semibold mb-2">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Making Charges, Discount, and GST should be entered as <strong>percentage (%)</strong></li>
                        <li>For stones (Diamond, Ruby, etc.), enter weight in <strong>karat</strong> and amount</li>
                        <li>For Gold and Silver, enter weight in <strong>grams (gms)</strong> and amount</li>
                        {/* <li>For Gold and Silver, enter weight in <strong>grams (gms)</strong></li> */}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Price Details</h3>
                  <Button
                    type="button"
                    onClick={addPriceDetail}
                    className="btn btn-sm btn-outline"
                  >
                    <Icon icon="ph:plus" className="mr-2" />
                    Add Price Detail
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.priceDetails.map((detail, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={detail.name}
                        onChange={(e) => {
                          // Create completely new objects to avoid mutating frozen objects
                          const newDetails = formData.priceDetails.map((d, i) => 
                            i === index 
                              ? { name: e.target.value, weight: d.weight || '', value: typeof d.value === 'number' ? d.value : parseFloat(d.value || 0) }
                              : { name: d.name || '', weight: d.weight || '', value: typeof d.value === 'number' ? d.value : parseFloat(d.value || 0) }
                          );
                          setFormData(prev => {
                            const updated = { ...prev, priceDetails: newDetails };
                            // Trigger recalculation if making charges percentage changes
                            const name = e.target.value?.toLowerCase() || '';
                            if (name.includes('making charges')) {
                              setTimeout(() => {
                                const recalculated = recalculatePriceDetails(updated);
                                if (recalculated) {
                                  setFormData(prevState => ({ ...prevState, priceDetails: recalculated }));
                                }
                              }, 0);
                            }
                            return updated;
                          });
                        }}
                        placeholder="Name (e.g., Gold, Stone, Making Charges)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                      <input
                        type="text"
                        value={detail.weight || ''}
                        onChange={(e) => {
                          // Create completely new objects to avoid mutating frozen objects
                          const newDetails = formData.priceDetails.map((d, i) => 
                            i === index 
                              ? { name: d.name || '', weight: e.target.value, value: typeof d.value === 'number' ? d.value : parseFloat(d.value || 0) }
                              : { name: d.name || '', weight: d.weight || '', value: typeof d.value === 'number' ? d.value : parseFloat(d.value || 0) }
                          );
                          setFormData(prev => {
                            const updated = { ...prev, priceDetails: newDetails };
                            // Trigger recalculation if this is a metal entry or making charges
                            const name = detail.name?.toLowerCase() || '';
                            const metalName = prev.metalType === 'gold' ? 'Gold' : 'Silver';
                            if (name.includes(metalName.toLowerCase()) || name.includes('making charges')) {
                              // Recalculate after state update
                              setTimeout(() => {
                                const recalculated = recalculatePriceDetails(updated);
                                if (recalculated) {
                                  setFormData(prevState => ({ ...prevState, priceDetails: recalculated }));
                                }
                              }, 0);
                            }
                            return updated;
                          });
                        }}
                        placeholder="Weight (e.g., 2.903g) or % for Making Charges"
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                      <input
                        type="number"
                        value={detail.value || ''}
                        onChange={(e) => {
                          // Create completely new objects to avoid mutating frozen objects
                          const newValue = parseFloat(e.target.value) || 0;
                          const newDetails = formData.priceDetails.map((d, i) => 
                            i === index 
                              ? { name: d.name || '', weight: d.weight || '', value: newValue }
                              : { name: d.name || '', weight: d.weight || '', value: typeof d.value === 'number' ? d.value : parseFloat(d.value || 0) }
                          );
                          setFormData(prev => {
                            const updated = { ...prev, priceDetails: newDetails };
                            // Trigger recalculation if this affects totals (stones, making charges)
                            const name = detail.name?.toLowerCase() || '';
                            if (name.includes('stone') || name.includes('diamond') || name.includes('ruby') || 
                                name.includes('emerald') || name.includes('sapphire') || name.includes('pearl') ||
                                name.includes('making charges')) {
                              setTimeout(() => {
                                const recalculated = recalculatePriceDetails(updated);
                                if (recalculated) {
                                  setFormData(prevState => ({ ...prevState, priceDetails: recalculated }));
                                }
                              }, 0);
                            }
                            return updated;
                          });
                        }}
                        placeholder="Value"
                        min="0"
                        step="0.01"
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                      <Button
                        type="button"
                        onClick={() => removePriceDetail(index)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Price Calculation Summary */}
                {(() => {
                  const metalName = formData.metalType === 'gold' ? 'Gold' : 'Silver';
                  const metalEntry = formData.priceDetails.find(d => 
                    d.name?.toLowerCase().includes(metalName.toLowerCase())
                  );
                  const stonesTotal = formData.priceDetails
                    .filter(d => {
                      const name = d.name?.toLowerCase() || '';
                      return (name.includes('stone') || name.includes('diamond') || name.includes('ruby') || 
                              name.includes('emerald') || name.includes('sapphire') || name.includes('pearl')) &&
                             !name.includes(metalName.toLowerCase());
                    })
                    .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
                  const makingChargesEntry = formData.priceDetails.find(d => 
                    d.name?.toLowerCase().includes('making charges')
                  );
                  const subtotalEntry = formData.priceDetails.find(d => 
                    d.name?.toLowerCase().includes('sub total') && !d.name?.toLowerCase().includes('after')
                  );
                  const discountEntry = formData.priceDetails.find(d => 
                    d.name?.toLowerCase().includes('discount')
                  );
                  const gstEntry = formData.priceDetails.find(d => 
                    d.name?.toLowerCase().includes('gst') && !d.name?.toLowerCase().includes('cgst') && !d.name?.toLowerCase().includes('sgst')
                  );
                  const grandTotalEntry = formData.priceDetails.find(d => 
                    d.name?.toLowerCase().includes('grand total')
                  );

                  if (!metalEntry || !metalEntry.weight) return null;

                  return (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                        <Icon icon="ph:calculator" className="mr-2" />
                        Price Calculation Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            {metalName} ({formData.selectedCaret}):
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ₹{metalEntry.value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                        {stonesTotal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">Stones:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₹{stonesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {makingChargesEntry && makingChargesEntry.value > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">
                              Making Charges ({makingChargesEntry.weight}):
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₹{makingChargesEntry.value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </div>
                        )}
                        {subtotalEntry && (
                          <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-700">
                            <span className="font-medium text-gray-900 dark:text-white">Sub Total:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₹{subtotalEntry.value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </div>
                        )}
                        {discountEntry && discountEntry.value > 0 && (
                          <div className="flex justify-between text-red-600 dark:text-red-400">
                            <span>Discount ({discountEntry.weight}):</span>
                            <span className="font-medium">
                              -₹{discountEntry.value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </div>
                        )}
                        {gstEntry && gstEntry.value > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">
                              GST ({gstEntry.weight}):
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₹{gstEntry.value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </div>
                        )}
                        {grandTotalEntry && (
                          <div className="flex justify-between pt-2 border-t-2 border-green-300 dark:border-green-600">
                            <span className="text-lg font-bold text-green-800 dark:text-green-200">Grand Total:</span>
                            <span className="text-lg font-bold text-green-800 dark:text-green-200">
                              ₹{grandTotalEntry.value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="btn btn-outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding || isUpdating || isUploading}
                  className="btn btn-primary"
                >
                  {isAdding || isUpdating || isUploading ? (
                    <>
                      <Icon icon="ph:spinner" className="animate-spin mr-2" />
                      {isEdit ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Icon icon="ph:check" className="mr-2" />
                      {isEdit ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Image Upload & Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card title="Product Images">
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon icon="ph:cloud-arrow-up" className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isUploading ? 'Uploading...' : 'Click to upload images & videos'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Images (PNG, JPG, GIF, WEBP) & Videos (MP4, WEBM, MOV) up to 5MB each
                  </p>
                </label>
              </div>

              {/* Image & Video Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uploaded Media ({uploadedImages.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((media, index) => {
                      const mediaUrl = typeof media === 'string' ? media : media.url || media;
                      const isVideo = mediaUrl && (
                        mediaUrl.includes('.mp4') || 
                        mediaUrl.includes('.webm') || 
                        mediaUrl.includes('.mov') ||
                        mediaUrl.includes('/video/') ||
                        (typeof media === 'object' && media.format && media.format.includes('video'))
                      );
                      
                      return (
                        <div key={index} className="relative group">
                          {isVideo ? (
                            <video
                              src={mediaUrl}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              controls
                              muted
                            />
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            />
                          )}
                          <Button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 btn btn-sm btn-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon icon="ph:x" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Preview */}
              {formData.name && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Product Preview
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">{formData.brand}</p>
                      <p className="text-gray-600 dark:text-gray-400">SKU: {formData.skuId}</p>
                      {formData.stock > 0 && (
                        <p className="text-gray-600 dark:text-gray-400">Stock: {formData.stock}</p>
                      )}
                      {formData.selectedCaret && (
                        <p className="text-gray-600 dark:text-gray-400">Carat: {formData.selectedCaret}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.active && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                        )}
                        {formData.CurrentlyNotavaiable && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Not Available</span>
                        )}
                        {formData.popular && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Popular</span>
                        )}
                        {formData.trending && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Trending</span>
                        )}
                        {formData.isDiscountAvaiable && formData.Discount > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">{formData.Discount}% Off</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;
