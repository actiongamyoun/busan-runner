'use client';

import { useState, useEffect } from 'react';
import { useApp } from './AppProvider';
import { validateImage, fileToDataUrl, uploadImage } from '@/lib/image-upload';

const CATEGORIES = ['러닝화', 'GPS 워치', '러닝웨어', '액세서리', '나눔/교환'] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    title: string; category: string; price: number;
    condition: string; location: string; description: string;
    image_url: string | null;
    seller_nick: string; seller_color: string;
  }) => Promise<void>;
};

export function MarketCreateModal({ open, onClose, onSubmit }: Props) {
  const { t, lang, showToast, sessionId, profile } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('사용감 적음');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(''); setCategory(''); setPrice(''); setCondition('사용감 적음');
    setLocation(''); setDescription('');
    setPhotoFile(null); setPhotoPreview(''); setPhotoError('');
    setErrors({});
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  // 카테고리 변경 시 나눔이면 가격 0 고정
  useEffect(() => {
    if (category === '나눔/교환') setPrice('0');
  }, [category]);

  if (!open) return null;

  const priceDisabled = category === '나눔/교환';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    try {
      await validateImage(file, lang);
      const preview = await fileToDataUrl(file);
      setPhotoFile(file);
      setPhotoPreview(preview);
    } catch (err: any) {
      setPhotoError(err.message);
      showToast('⚠️ ' + err.message);
      setPhotoFile(null);
      setPhotoPreview('');
      e.target.value = '';
    }
  };

  const removePhoto = () => {
    setPhotoFile(null); setPhotoPreview(''); setPhotoError('');
  };

  const validate = () => {
    const err: Record<string, boolean> = {};
    if (!title.trim()) err.title = true;
    if (!category) err.category = true;
    if (!priceDisabled && price === '') err.price = true;
    if (!location.trim()) err.location = true;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast(t('common.form.warn'));
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (photoFile) {
        imageUrl = await uploadImage('market', photoFile, sessionId);
      }
      await onSubmit({
        title: title.trim(),
        category,
        price: category === '나눔/교환' ? 0 : parseInt(price) || 0,
        condition,
        location: location.trim(),
        description: description.trim(),
        image_url: imageUrl,
        seller_nick: profile.nickname,
        seller_color: profile.color,
      });
      showToast(t('market.created.toast'));
      onClose();
    } catch (e: any) {
      console.error(e);
      showToast(t('img.err.upload'));
    } finally {
      setSubmitting(false);
    }
  };

  const catLabelMap: Record<string, string> = {
    '러닝화': t('market.cat.shoes'),
    'GPS 워치': t('market.cat.watch'),
    '러닝웨어': t('market.cat.wear'),
    '액세서리': t('market.cat.accessory'),
    '나눔/교환': t('market.cat.share'),
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <span className="modal-handle" />
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{t('market.modal.new')}</div>
            <h2 className="modal-title">{t('market.modal.title')}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">

          {/* 사진 */}
          <div className={`form-group ${photoError ? 'error' : ''}`}>
            <label className="form-label">
              {t('crew.modal.photo.label')} <span style={{ color: 'var(--mute)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('crew.modal.photo.optional')}</span>
            </label>
            <div className={`img-upload ${photoPreview ? 'has-image' : ''}`}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
              {photoPreview && <img src={photoPreview} alt="" />}
              {!photoPreview && (
                <div className="img-upload-placeholder">
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <div className="t">{t('crew.modal.photo.cta')}</div>
                  <div className="s">{t('crew.modal.photo.hint')}</div>
                </div>
              )}
              {photoPreview && (
                <button type="button" className="img-upload-remove" onClick={(e) => { e.stopPropagation(); removePhoto(); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            {photoError && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{photoError}</div>}
          </div>

          <div className={`form-group ${errors.title ? 'error' : ''}`}>
            <label className="form-label">{t('market.modal.titleInput.label')}</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} maxLength={50} placeholder={t('market.modal.titleInput.placeholder')} />
            <div className="form-error">{t('market.modal.titleInput.error')}</div>
          </div>

          <div className={`form-group ${errors.category ? 'error' : ''}`}>
            <label className="form-label">{t('market.modal.cat.label')}</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">{t('market.modal.cat.placeholder')}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{catLabelMap[c]}</option>)}
            </select>
            <div className="form-error">{t('market.modal.cat.error')}</div>
          </div>

          <div className="form-group row">
            <div className={errors.price ? 'error' : ''}>
              <label className="form-label">{t('market.modal.price.label')}</label>
              <input className="form-input" type="number" min={0} step={1000} value={price} onChange={e => setPrice(e.target.value)} disabled={priceDisabled} placeholder="0" />
              <div className="form-hint">{t('market.modal.price.hint')}</div>
              {errors.price && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('market.modal.price.error')}</div>}
            </div>
            <div>
              <label className="form-label">{t('market.modal.condition.label')}</label>
              <select className="form-select" value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="새제품">{t('market.modal.condition.new')}</option>
                <option value="거의 새것">{t('market.modal.condition.likenew')}</option>
                <option value="사용감 적음">{t('market.modal.condition.light')}</option>
                <option value="사용감 있음">{t('market.modal.condition.used')}</option>
              </select>
            </div>
          </div>

          <div className={`form-group ${errors.location ? 'error' : ''}`}>
            <label className="form-label">{t('market.modal.loc.label')}</label>
            <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} maxLength={30} placeholder={t('market.modal.loc.placeholder')} />
            <div className="form-error">{t('market.modal.loc.error')}</div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('market.modal.desc.label')}</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} maxLength={500} placeholder={t('market.modal.desc.placeholder')} />
          </div>

          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('common.loading') : t('market.modal.submit')}
            </button>
            <button className="btn-secondary" onClick={onClose} disabled={submitting}>{t('market.modal.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
