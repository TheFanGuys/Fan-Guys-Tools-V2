/* Estimate → real PDF file, then the iPhone share sheet (Save to Files, Drive, Mail, Print).
   window.print() does nothing inside a home-screen app on iPhone, so this replaces it. */
(function () {
  function txt(el) { return el ? el.textContent.replace(/[✎✏️]/g, '').replace(/\s+/g, ' ').trim() : ''; }
  function rows(id) {
    var out = [], box = document.getElementById(id);
    if (!box) return out;
    box.querySelectorAll('.line-item').forEach(function (r) {
      var amt = txt(r.lastElementChild).match(/-?\$[\d,]+(\.\d+)?/);
      out.push({ label: txt(r.querySelector('.li-label')), detail: txt(r.querySelector('.li-detail')), amt: amt ? amt[0] : txt(r.lastElementChild) });
    });
    return out;
  }
  function clean(s) { return String(s || '').replace(/[^\x20-\x7E -ÿ]/g, '').replace(/\s+/g, ' ').trim(); }

  function build() {
    var J = window.jspdf && window.jspdf.jsPDF;
    if (!J) throw new Error('PDF maker did not load');
    var doc = new J({ unit: 'pt', format: 'letter' });
    var W = 612, M = 48, y = 0;
    var job = (window.FGT && FGT.currentJob && FGT.currentJob()) || null;
    var date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Header band
    doc.setFillColor(27, 28, 30); doc.rect(0, 0, W, 86, 'F');
    doc.setFillColor(242, 140, 15); doc.rect(0, 86, W, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
    doc.setTextColor(242, 242, 240); doc.text('FAN', M, 52);
    doc.setTextColor(242, 140, 15); doc.text('GUYS', M + doc.getTextWidth('FAN '), 52);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(200, 204, 208);
    doc.text('Job Estimate', M, 70);
    doc.text(date, W - M, 52, { align: 'right' });
    y = 122;

    // Job
    doc.setTextColor(23, 24, 26);
    if (job && job.name) { doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(clean(job.name), M, y); y += 18; }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(70, 74, 79);
    if (job) {
      var addr = [job.street, [job.city, [job.state, job.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter(Boolean).join(', ');
      if (addr) { doc.text(clean(addr), M, y); y += 15; }
      if (job.customer) { doc.text('Customer: ' + clean(job.customer), M, y); y += 15; }
    }
    [txt(document.getElementById('res-desc')), txt(document.getElementById('res-fans')), (document.getElementById('res-city') ? document.getElementById('res-city').textContent.replace(/\s*\u00a0+\s*/g, ' · ').replace(/\s+/g, ' ').trim() : '')]
      .filter(Boolean).forEach(function (s) { doc.text(doc.splitTextToSize(clean(s), W - 2 * M), M, y); y += 15; });
    y += 10;

    function section(title, list) {
      if (!list.length) return;
      if (y > 680) { doc.addPage(); y = 60; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(226, 85, 10);
      doc.text(title.toUpperCase(), M, y); y += 8;
      doc.setDrawColor(242, 140, 15); doc.setLineWidth(1); doc.line(M, y, W - M, y); y += 18;
      list.forEach(function (r) {
        if (y > 720) { doc.addPage(); y = 60; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(23, 24, 26);
        doc.text(clean(r.label), M, y);
        doc.text(clean(r.amt), W - M, y, { align: 'right' });
        if (r.detail) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(110, 114, 119); doc.text(clean(r.detail), M, y + 13); }
        y += r.detail ? 26 : 18;
        doc.setDrawColor(225, 227, 230); doc.setLineWidth(0.5); doc.line(M, y - 8, W - M, y - 8);
        y += 4;
      });
      y += 10;
    }
    section('Labor', rows('res-labor'));
    section('Materials & Travel', rows('res-costs'));

    // Totals
    if (y > 620) { doc.addPage(); y = 60; }
    var boxTop = y;
    var tots = [['Labor Total', 't-labor'], ['Materials & Travel', 't-costs'], ['Combined Cost', 't-combined'], [txt(document.querySelector('#t-margin') && document.querySelector('#t-margin').previousElementSibling) || 'Margin', 't-margin']];
    doc.setFillColor(244, 245, 246); doc.roundedRect(M - 10, boxTop - 16, W - 2 * M + 20, 26 * tots.length + 62, 6, 6, 'F');
    tots.forEach(function (t) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(70, 74, 79); doc.text(clean(t[0]), M, y);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(23, 24, 26); doc.text(clean(txt(document.getElementById(t[1]))), W - M, y, { align: 'right' });
      y += 26;
    });
    doc.setDrawColor(242, 140, 15); doc.setLineWidth(1.5); doc.line(M, y - 12, W - M, y - 12);
    y += 14;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(23, 24, 26); doc.text('SUGGESTED QUOTE', M, y);
    doc.setFontSize(22); doc.setTextColor(226, 85, 10); doc.text(clean(txt(document.getElementById('t-quote'))), W - M, y + 2, { align: 'right' });

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(150, 154, 159);
    doc.text('Fan Guys  -  estimate made ' + date + '. Travel and hotel are estimates.', M, 760);

    var nm = 'Estimate' + (job && job.name ? ' - ' + clean(job.name).replace(/[\\/:*?"<>|]/g, '') : '') + ' - ' + new Date().toISOString().slice(0, 10) + '.pdf';
    return { blob: doc.output('blob'), name: nm };
  }

  function save() {
    var out;
    try { out = build(); } catch (e) { alert('Could not make the PDF: ' + e.message); return; }
    var file;
    try { file = new File([out.blob], out.name, { type: 'application/pdf' }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch(function (e) { if (e && e.name !== 'AbortError') download(out); });
    } else download(out);
  }
  function download(out) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(out.blob); a.download = out.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
  }

  window.FGTEstimatePDF = { build: build, save: save };
})();
