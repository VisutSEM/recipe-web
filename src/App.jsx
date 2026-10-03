import React, { useState, useRef } from 'react';
import './App.css';

const defaultData = {
  invoiceNo: '056',
  customerName: '',
  phoneNumber: '',
  businessType: '',
  eventLocation: '',
  date: '',
  paymentMethod: '',
  items: [
    { description: '', qty: '', unitPrice: '', total: '' },
  ],
  discount: '',
  deposit: '',
  note: '',
};

export default function App() {
  const [form, setForm] = useState(defaultData);
  const [qrImage, setQrImage] = useState(null);
  const printRef = useRef();

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setQrImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-calc total
    if (field === 'qty' || field === 'unitPrice') {
      const qty = field === 'qty' ? Number(value) : Number(updated[index].qty);
      const price = field === 'unitPrice' ? Number(value) : Number(updated[index].unitPrice);
      updated[index].total = (qty * price) || '';
    }
    setForm(prev => ({ ...prev, items: updated }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', qty: '', unitPrice: '', total: '' }],
    }));
  };

  const removeItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const subtotal = form.items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  const discountAmt = Number(form.discount) || 0;
  const depositAmt = Number(form.deposit) || 0;
  const grandTotal = subtotal - discountAmt;
  const remainingBalance = grandTotal - depositAmt;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '-';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const today = new Date().toLocaleDateString('km-KH', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  return (
    <div className="app-wrapper">
      {/* ===== LEFT: FORM EDITOR ===== */}
      <div className="form-panel no-print">
        <div className="form-header">
          <div className="form-logo">
            <span className="logo-srm">SRM</span>
          </div>
          <div>
            <h1 className="form-title">Invoice Editor</h1>
            <p className="form-subtitle">Vinn Ricky Sound</p>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">📋 ព័ត៌មានវិក្កយបត្រ</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Invoice No</label>
              <input
                type="text"
                value={form.invoiceNo}
                onChange={e => handleChange('invoiceNo', e.target.value)}
                placeholder="056"
              />
            </div>
            <div className="form-group">
              <label>កាលបរិច្ឆេទ (Date)</label>
              <input
                type="date"
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">👤 ព័ត៌មានអតិថិជន</h3>
          <div className="form-group">
            <label>Customer Name / ឈ្មោះ</label>
            <input
              type="text"
              value={form.customerName}
              onChange={e => handleChange('customerName', e.target.value)}
              placeholder="ឈ្មោះអតិថិជន"
            />
          </div>
          <div className="form-group">
            <label>Phone Number / លេខទូរស័ព្ទ</label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              placeholder="096 9999 230"
            />
          </div>
          <div className="form-group">
            <label>ប្រភេទតន្រ្តី (Business Type)</label>
            <input
              type="text"
              value={form.businessType}
              onChange={e => handleChange('businessType', e.target.value)}
              placeholder="អគ្គីស, ភោជនីយដ្ឋាន..."
            />
          </div>
          <div className="form-group">
            <label>ទីតាំងប្រគុំ (Venue / Location)</label>
            <input
              type="text"
              value={form.eventLocation}
              onChange={e => handleChange('eventLocation', e.target.value)}
              placeholder="ភូមិ, ខេត្ត, ទីក្រុង..."
            />
          </div>
          <div className="form-group">
            <label>វិធីសាស្ត្របង់ប្រាក់(Payment Method)</label>
            <select
              value={form.paymentMethod}
              onChange={e => handleChange('paymentMethod', e.target.value)}
            >
              <option value="">-- ជ្រើសរើស --</option>
              <option value="សាច់ប្រាក់">សាច់ប្រាក់ (Cash)</option>
              <option value="បណ្តោល(បាក់ដំបង)">បណ្តោល (Credit)</option>
              <option value="ABA Transfer">ABA Transfer</option>
              <option value="ACLEDA Transfer">ACLEDA Transfer</option>
              <option value="Wing Transfer">Wing Transfer</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">📦 បញ្ជីទំនិញ / Services</h3>
          <div className="items-header-row">
            <span>ការពិពណ៌នា</span>
            <span>ចំនួន</span>
            <span>តម្លៃ ($)</span>
            <span>សរុប ($)</span>
            <span></span>
          </div>
          {form.items.map((item, idx) => (
            <div key={idx} className="item-row">
              <input
                type="text"
                value={item.description}
                onChange={e => handleItemChange(idx, 'description', e.target.value)}
                placeholder="ឈ្មោះទំនិញ..."
                className="item-desc"
              />
              <input
                type="number"
                value={item.qty}
                onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                placeholder="0"
                min="0"
              />
              <input
                type="number"
                value={item.unitPrice}
                onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                value={item.total}
                readOnly
                placeholder="0.00"
                className="item-total-input"
              />
              <button className="remove-btn" onClick={() => removeItem(idx)}>✕</button>
            </div>
          ))}
          <button className="add-item-btn" onClick={addItem}>+ បន្ថែមទំនិញ</button>
        </div>

        <div className="form-section">
          <h3 className="section-title">💰 សង្ខេបសរុប</h3>
          <div className="form-group">
            <label>ការបញ្ចុះតម្លៃ / Discount ($)</label>
            <input
              type="number"
              value={form.discount}
              onChange={e => handleChange('discount', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>លុយកក់ / Deposit ($)</label>
            <input
              type="number"
              value={form.deposit}
              onChange={e => handleChange('deposit', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>កំណត់ចំណាំ / Note</label>
            <textarea
              value={form.note}
              onChange={e => handleChange('note', e.target.value)}
              placeholder="កំណត់ចំណាំបន្ថែម..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">📱 KHQR Code</h3>
          <div className="qr-upload-area">
            {qrImage ? (
              <div className="qr-preview-wrap">
                <img src={qrImage} alt="KHQR Preview" className="qr-preview-thumb" />
                <button className="qr-remove-btn" onClick={() => setQrImage(null)}>✕ លុបចោល</button>
              </div>
            ) : (
              <label className="qr-upload-label" htmlFor="qr-upload-input">
                <div className="qr-upload-icon">📷</div>
                <div className="qr-upload-text">ចុចដើម្បីផ្ទុក QR Code</div>
                <div className="qr-upload-hint">PNG, JPG supported</div>
              </label>
            )}
            <input
              id="qr-upload-input"
              type="file"
              accept="image/*"
              onChange={handleQrUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <button className="print-btn" onClick={handlePrint}>
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* ===== RIGHT: INVOICE PREVIEW ===== */}
      <div className="preview-panel">
        <div className="preview-label no-print">Live Preview</div>
        <div className="invoice" ref={printRef} id="invoice-print">

          {/* Header */}
          <div className="inv-header">
            <div className="inv-logo-block">
              <div className="inv-logo-box">
                <span className="inv-logo-srm">VRS</span>
                <span className="inv-logo-sub">VINN RICKY SOUND</span>
              </div>
              <div className="inv-company-info">
                <div className="inv-company-kh">វីន Sound</div>
                <div className="inv-company-en">VINN RICKY SOUND</div>
                <p></p>
              </div>
            </div>
            <div className="inv-title-block">
              <div className="inv-title">INVOICE</div>
            </div>
          </div>

          {/* Promo Banner (Second Header) */}
          <div className="inv-promo-banner">
            <div className="inv-promo-title">ហ៊ាវិន តន្រ្តី ក្រុងសៀមរាប</div>
            <div className="inv-promo-tagline">យើងខ្ញុំមានទទួលរៀបចំដូចជា</div>
            <div className="inv-promo-services">
              <span className="inv-promo-service">🎤 មេក្រូធុងបាស</span>
              <span className="inv-promo-service">🎹 អកកេះ</span>
              <span className="inv-promo-service">🎸 អកកាដង់</span>
              <span className="inv-promo-service">🎧 ឌឺជេ</span>
              <span className="inv-promo-service">💨 ផ្សែងពពក</span>
              <span className="inv-promo-service">💡 ភ្លើងពណ៌</span>
              <span className="inv-promo-service">🎪 ឆាក</span>
              <span className="inv-promo-service">⚡ ម៉ាស៊ីនភ្លើង</span>
            </div>
            <div className="inv-promo-price">✨ តម្លៃសមរម្យ ✨</div>
            <div className="inv-promo-contact">
              <span>📞</span>
              <span className="inv-promo-phone">0965 854 902</span>
              <span>❤️ 🙏 🌺</span>
            </div>
          </div>

          {/* Company Details */}
          <div className="inv-contact">
            <div className="inv-contact-left">
              <div><span className="contact-icon">📞</span> 096 585 4902</div>
              <div><span className="contact-icon">📍</span> Banteaychuer Village, Tuekvil Commune, Siemreap provence</div>
              <div><span className="contact-icon">🏦</span> ABA: 009999230 (VINN)</div>
            </div>
            <div className="inv-meta">
              <div className="inv-meta-row">
                <span className="inv-meta-label">Invoice No</span>
                <span className="inv-meta-dots">:</span>
                <span className="inv-meta-value inv-no">{form.invoiceNo || '___'}</span>
              </div>
              <div className="inv-meta-row">
                <span className="inv-meta-label">Customer Name</span>
                <span className="inv-meta-dots">:</span>
                <span className="inv-meta-value">{form.customerName || '___________'}</span>
              </div>
              <div className="inv-meta-row">
                <span className="inv-meta-label">Phone Number</span>
                <span className="inv-meta-dots">:</span>
                <span className="inv-meta-value">{form.phoneNumber || '___________'}</span>
              </div>
            </div>
          </div>

          {/* Info Table */}
          <div className="inv-info-table">
            <div className="inv-info-row">
              <div className="inv-info-cell label-cell">ប្រភេទតន្រ្តី</div>
              <div className="inv-info-cell value-cell">{form.businessType || <span className="placeholder-text">___________</span>}</div>
            </div>
            <div className="inv-info-row">
              <div className="inv-info-cell label-cell">កាលបរិច្ឆេទ</div>
              <div className="inv-info-cell value-cell">
                {form.date
                  ? new Date(form.date).toLocaleDateString('en-GB').replace(/\//g, '/')
                  : '__ / __ / ____'}
              </div>
            </div>
            <div className="inv-info-row">
              <div className="inv-info-cell label-cell">ទីតាំងប្រគុំ</div>
              <div className="inv-info-cell value-cell">{form.eventLocation || <span className="placeholder-text">___________</span>}</div>
            </div>
            <div className="inv-info-row">
              <div className="inv-info-cell label-cell">វិធីសាស្ត្របង់ប្រាក់</div>
              <div className="inv-info-cell value-cell">{form.paymentMethod || <span className="placeholder-text">___________</span>}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="inv-items-table">
            <thead>
              <tr>
                <th className="col-no">ល.រ</th>
                <th className="col-desc">ការពិពណ៌នា / Description</th>
                <th className="col-qty">ចំនួន</th>
                <th className="col-price">តម្លៃ ($)</th>
                <th className="col-total">សរុប ($)</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="col-no">{idx + 1}</td>
                  <td className="col-desc">{item.description || '-'}</td>
                  <td className="col-qty">{item.qty || '-'}</td>
                  <td className="col-price">{formatCurrency(item.unitPrice)}</td>
                  <td className="col-total">{formatCurrency(item.total)}</td>
                </tr>
              ))}
              {/* Padding rows to fill space */}
              {form.items.length < 5 && Array.from({ length: 5 - form.items.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="empty-row">
                  <td>{form.items.length + i + 1}</td>
                  <td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="inv-footer">
            <div className="inv-footer-left">
              {/* Simple QR */}
              <div className="simple-qr-box">
                {qrImage
                  ? <img src={qrImage} alt="QR Code" className="simple-qr-img" />
                  : <label htmlFor="qr-upload-input" className="simple-qr-upload-prompt no-print">
                    <div className="simple-qr-upload-prompt-icon">📷</div>
                    <div className="simple-qr-upload-prompt-text">ផ្ទុក QR</div>
                  </label>
                }
              </div>
              {form.note && (
                <div className="inv-note">
                  <strong>* កំណត់ចំណាំ:</strong> {form.note}
                </div>
              )}
            </div>

            <div className="inv-summary">
              <div className="inv-summary-title">សង្ខេបសរុប</div>
              <div className="inv-summary-row grand">
                <span>លុយសរុប</span>
                <span>${formatCurrency(grandTotal)}</span>
              </div>
              <div className="inv-summary-row">
                <span>លុយកក់</span>
                <span>${formatCurrency(depositAmt)}</span>
              </div>
              <div className="inv-summary-row grand">
                <span>លុយត្រូវបង់</span>
                <span>${formatCurrency(remainingBalance)}</span>
              </div>

              <div className="inv-sign-block">
                <p>សៀមរាប, ថ្ងៃ {form.date ? new Date(form.date).getDate() : '20'} ខែ {form.date ? new Date(form.date).getMonth() + 1 : '08'} ឆ្នាំ {form.date ? new Date(form.date).getFullYear() : '202_'}</p>
                <p className="sign-label"></p>
                {/* <div className="sign-line"></div> */}
              </div>
            </div>
          </div>

          <div className="inv-footer-note">
            * សូរ! ព្រោះការទូទាត់ប្រាក់រួចហើយ ទំនិញ មិនអាចផ្លាស់ប្ដូរបានទេ។
          </div>

        </div>
      </div>
    </div>
  );
}