'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, X, Shield, Loader2, Building, Mail, Phone, User, MessageSquareText } from 'lucide-react';
import { chatApiService, LeadFormData, ApiError } from '@/lib/apiService';

interface LeadCaptureFormProps {
  conversationId: string;
  onSuccess: (leadId: string, message: string) => void;
  onCancel?: () => void;
  initialService?: string;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  conversationId,
  onSuccess,
  onCancel,
  initialService = 'Cybersecurity Services',
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    serviceOfInterest: initialService,
    message: '',
    conversationId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{ leadId: string; message: string } | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone validation
    const phoneClean = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (phoneClean.length < 7 || !/^\d+$/.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid phone number (at least 7 digits).';
    }

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = 'Company / Organization name is required.';
    }

    // Customer message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide details about your request or enquiry.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await chatApiService.submitLeadForm({
        ...formData,
        conversationId,
      });

      if (response.success) {
        setSubmitSuccess({ leadId: response.leadId, message: response.message });
        onSuccess(response.leadId, response.message);
      } else {
        throw new Error(response.message || 'Failed to capture lead details.');
      }
    } catch (err: unknown) {
      let msg = 'Failed to submit enquiry. Please check your details and try again.';
      if (err instanceof ApiError) msg = err.message;
      else if (err instanceof Error) msg = err.message;

      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (submitSuccess) {
    return (
      <div className="my-3 p-5 rounded-2xl bg-teal-950/70 border border-teal-500/40 text-teal-100 shadow-xl backdrop-blur-md animate-fade-in space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-teal-200">Request Submitted Successfully</h3>
            <span className="text-xs font-mono text-teal-400">Reference: {submitSuccess.leadId}</span>
          </div>
        </div>
        <p className="text-xs text-teal-200/90 leading-relaxed">{submitSuccess.message}</p>
      </div>
    );
  }

  return (
    <div className="my-3 p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-teal-500/40 text-slate-100 shadow-2xl backdrop-blur-xl animate-fade-in max-w-xl mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Apexium Lead Consultation Request</h3>
            <p className="text-[11px] text-slate-400 font-mono">Connect with our sales & technical engineers</p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Global Submit Error Banner */}
      {submitError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
              <User className="w-3 h-3 text-teal-400" /> Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Sarah Jenkins"
              disabled={isSubmitting}
              className={`w-full bg-slate-950 border text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                errors.fullName ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-teal-500/60'
              }`}
            />
            {errors.fullName && <p className="text-[10px] text-red-400 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
              <Mail className="w-3 h-3 text-teal-400" /> Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="s.jenkins@company.com"
              disabled={isSubmitting}
              className={`w-full bg-slate-950 border text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-teal-500/60'
              }`}
            />
            {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Phone & Company Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phone */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-teal-400" /> Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 234-5678"
              disabled={isSubmitting}
              className={`w-full bg-slate-950 border text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                errors.phone ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-teal-500/60'
              }`}
            />
            {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone}</p>}
          </div>

          {/* Company */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
              <Building className="w-3 h-3 text-teal-400" /> Company / Organization *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Acme Enterprises"
              disabled={isSubmitting}
              className={`w-full bg-slate-950 border text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                errors.company ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-teal-500/60'
              }`}
            />
            {errors.company && <p className="text-[10px] text-red-400 mt-1">{errors.company}</p>}
          </div>
        </div>

        {/* Service of Interest */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
            <Shield className="w-3 h-3 text-teal-400" /> Service of Interest
          </label>
          <select
            value={formData.serviceOfInterest}
            onChange={(e) => handleChange('serviceOfInterest', e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500/60"
          >
            <option value="Cybersecurity Services">Cybersecurity Services (Pen testing, SOC 24/7, ISO compliance)</option>
            <option value="Technology Services">Technology Services (Cloud migration, Custom dev, IT integration)</option>
            <option value="Training Programs">Training Programs (CISSP prep, staff awareness workshops)</option>
            <option value="General Enquiry / Enterprise Sales">General Enquiry / Enterprise Sales</option>
          </select>
        </div>

        {/* Customer Message */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
            <MessageSquareText className="w-3 h-3 text-teal-400" /> Customer Message / Enquiry *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Tell us about your organization scale, timeline, or specific service requirements..."
            rows={3}
            disabled={isSubmitting}
            className={`w-full bg-slate-950 border text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none resize-none transition-colors ${
              errors.message ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-teal-500/60'
            }`}
          />
          {errors.message && <p className="text-[10px] text-red-400 mt-1">{errors.message}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-teal-500/20 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Lead Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
