import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  Flag, AlertTriangle, Loader2, CheckCircle, Search,
  Camera, FileText, ChevronDown, X
} from 'lucide-react';
import { customerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api';

const ReportForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [serialCode, setSerialCode] = useState('');
  const [productName, setProductName] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.toLowerCase() !== 'customer') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    setLoading(false);

    // Pre-fill from URL params
    const serialFromUrl = searchParams.get('serial');
    const nameFromUrl = searchParams.get('name');
    if (serialFromUrl) setSerialCode(serialFromUrl);
    if (nameFromUrl) setProductName(decodeURIComponent(nameFromUrl));
  }, [navigate, searchParams]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!serialCode.trim()) {
      setError('Please enter a serial code');
      return;
    }
    
    if (!issueType) {
      setError('Please select an issue type');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      await axios.post(
        `${API_BASE}/customer/reports`,
        {
          serial_code: serialCode.trim(),
          product_name: productName,
          issue_type: issueType,
          description: description.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <Layout user={user} menuItems={customerMenuItems}>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted</h2>
            <p className="text-slate-600 mb-6">
              Thank you for reporting this issue. Our team will investigate and take appropriate action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/customer/dashboard"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setSerialCode('');
                  setProductName('');
                  setIssueType('');
                  setDescription('');
                  setPhotos([]);
                }}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Report Another
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} menuItems={customerMenuItems}>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Report a Problem</h2>
          <p className="text-slate-600">
            Report counterfeit, expired, or damaged products to help keep our supply chain safe
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800 mb-1">Important Notice</h4>
              <p className="text-sm text-orange-700">
                Please ensure you have verified the product before submitting a report. 
                False reports may result in account restrictions.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Serial Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Serial Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={serialCode}
                  onChange={(e) => setSerialCode(e.target.value)}
                  placeholder="Enter the product serial code"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                You can find this on the product packaging or by scanning the QR code
              </p>
            </div>

            {/* Product Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name (optional)"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Issue Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                >
                  <option value="">Select an issue type</option>
                  <option value="Counterfeit">Counterfeit / Fake Product</option>
                  <option value="Expired">Expired Product</option>
                  <option value="Damaged">Damaged / Defective Product</option>
                  <option value="Mislabeled">Mislabeled Product</option>
                  <option value="Tampered">Tampered Packaging</option>
                  <option value="Other">Other Issue</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the issue (where you purchased, what you noticed, etc.)"
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Click to upload photos</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB (max 5 photos)</p>
                </label>
              </div>
              
              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-slate-50 border-t rounded-b-xl">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-semibold transition"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Flag className="w-5 h-5" />
              )}
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              By submitting, you confirm that the information provided is accurate to the best of your knowledge.
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ReportForm;
