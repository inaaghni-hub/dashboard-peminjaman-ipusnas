"use strict";
/* Dashboard peminjaman iPusnas.
   Semua angka dirender dari data.json agar pembaruan data cukup mengganti
   berkas itu. Daftar judul lengkap (judul-1.json dan seterusnya,
   total sekitar 4,9 MB) dimuat hanya atas permintaan pengunjung. */

const fmt = (n) => n.toLocaleString("id-ID");
const fmtPersen = (n) => n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SINGKAT_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"];

function el(tag, kelas, teks) {
  const e = document.createElement(tag);
  if (kelas) e.className = kelas;
  if (teks !== undefined) e.textContent = teks;
  return e;
}

function renderBulan(perBulan) {
  const wadah = document.getElementById("grafik-bulan");
  const maks = Math.max(...perBulan.filter((b) => b.jumlah !== null).map((b) => b.jumlah));
  perBulan.forEach((b, i) => {
    const kolom = el("div", "kolom");
    if (b.jumlah === null) {
      kolom.appendChild(el("span", "nilai", "tidak ada data"));
      kolom.appendChild(el("div", "batang-kosong"));
      const nama = el("span", "nama");
      nama.append(SINGKAT_BULAN[i] + " ");
      nama.appendChild(el("span", "tanda", "*"));
      kolom.appendChild(nama);
    } else {
      kolom.appendChild(el("span", "nilai", fmt(b.jumlah)));
      const batang = el("div", "batang" + (b.jumlah === maks ? " puncak" : ""));
      batang.style.height = Math.max(2, Math.round((b.jumlah / maks) * 78)) + "%";
      kolom.appendChild(batang);
      kolom.appendChild(el("span", "nama", SINGKAT_BULAN[i]));
    }
    wadah.appendChild(kolom);
  });
}

function renderTop10(top10) {
  const tbody = document.getElementById("isi-top10");
  top10.forEach((r) => {
    const tr = document.createElement("tr");
    tr.appendChild(el("td", "peringkat", String(r.peringkat)));
    tr.appendChild(el("td", null, r.judul));
    tr.appendChild(el("td", null, r.subjek || ""));
    tr.appendChild(el("td", "kanan", fmt(r.jumlah)));
    tbody.appendChild(tr);
  });
}

function barisBatang(label, jumlah, persen, maks) {
  const baris = el("div", "baris-batang");
  baris.appendChild(el("span", "label", label));
  const rel = el("div", "rel");
  const isi = el("div", "isi");
  isi.style.width = Math.max(1, (jumlah / maks) * 100) + "%";
  rel.appendChild(isi);
  baris.appendChild(rel);
  baris.appendChild(el("span", "angka-baris", fmt(jumlah) + " (" + fmtPersen(persen) + "%)"));
  return baris;
}

function renderSubjek(perSubjek) {
  const wadah = document.getElementById("grafik-subjek");
  const maks = perSubjek[0].jumlah;
  perSubjek.slice(0, 12).forEach((s) => wadah.appendChild(barisBatang(s.subjek, s.jumlah, s.persen, maks)));
  const tbody = document.getElementById("isi-subjek");
  perSubjek.forEach((s) => {
    const tr = document.createElement("tr");
    tr.appendChild(el("td", null, s.subjek));
    tr.appendChild(el("td", "kanan", fmt(s.jumlah)));
    tr.appendChild(el("td", "kanan", fmtPersen(s.persen) + "%"));
    tbody.appendChild(tr);
  });
}

function renderEpustaka(perEpustaka) {
  const wadah = document.getElementById("grafik-epustaka");
  const maks = perEpustaka[0].jumlah;
  perEpustaka.forEach((s) => wadah.appendChild(barisBatang(s.epustaka, s.jumlah, s.persen, maks)));
}

/* Pencarian judul */
const PER_HAL = 25;
let semuaJudul = null;
let jumlahBerkasJudul = 0;
let daftarSubjek = [];
let hasilSaring = [];
let halaman = 1;

function gambarHasil() {
  const tbody = document.getElementById("isi-judul");
  tbody.textContent = "";
  const mulai = (halaman - 1) * PER_HAL;
  hasilSaring.slice(mulai, mulai + PER_HAL).forEach((r) => {
    const tr = document.createElement("tr");
    tr.appendChild(el("td", null, r[0]));
    tr.appendChild(el("td", null, r[1] || ""));
    tr.appendChild(el("td", "kanan", fmt(r[2])));
    tbody.appendChild(tr);
  });
  const totalHal = Math.max(1, Math.ceil(hasilSaring.length / PER_HAL));
  document.getElementById("info-hal").textContent =
    "Halaman " + fmt(halaman) + " dari " + fmt(totalHal);
  document.getElementById("hal-sebelum").disabled = halaman <= 1;
  document.getElementById("hal-berikut").disabled = halaman >= totalHal;
  document.getElementById("hasil-kosong").hidden = hasilSaring.length > 0;
  document.getElementById("status-hasil").textContent =
    hasilSaring.length === 0
      ? ""
      : "Ditemukan " + fmt(hasilSaring.length) + " judul. Menampilkan " + fmt(Math.min(PER_HAL, hasilSaring.length - mulai)) + " di halaman ini.";
}

function saring() {
  const kata = document.getElementById("kata-kunci").value.trim().toLowerCase();
  hasilSaring = kata
    ? semuaJudul.filter((r) => r[0].toLowerCase().includes(kata) || (r[1] || "").toLowerCase().includes(kata))
    : semuaJudul;
  halaman = 1;
  gambarHasil();
}

function pasangPencarian() {
  const tombol = document.getElementById("muat-judul");
  const status = document.getElementById("status-muat");
  tombol.addEventListener("click", async () => {
    tombol.disabled = true;
    status.textContent = "Memuat daftar judul, sebentar...";
    try {
      const potongan = await Promise.all(
        Array.from({ length: jumlahBerkasJudul }, (_, i) =>
          fetch("judul-" + (i + 1) + ".json").then((r) => {
            if (!r.ok) throw new Error("status " + r.status);
            return r.json();
          })
        )
      );
      semuaJudul = [];
      potongan.forEach((p) =>
        p.judul.forEach((r) => semuaJudul.push([r[0], daftarSubjek[r[1]] || "", r[2]]))
      );
      hasilSaring = semuaJudul;
      document.getElementById("alat-cari").hidden = false;
      tombol.hidden = true;
      status.textContent = "Daftar judul termuat: " + fmt(semuaJudul.length) + " judul.";
      gambarHasil();
    } catch (err) {
      status.textContent = "Daftar judul gagal dimuat. Periksa koneksi, lalu coba lagi.";
      tombol.disabled = false;
      tombol.textContent = "Coba muat lagi";
    }
  });
  let tunda = null;
  document.getElementById("kata-kunci").addEventListener("input", () => {
    clearTimeout(tunda);
    tunda = setTimeout(saring, 180);
  });
  document.getElementById("hal-sebelum").addEventListener("click", () => { halaman--; gambarHasil(); });
  document.getElementById("hal-berikut").addEventListener("click", () => { halaman++; gambarHasil(); });
}

async function mulai() {
  pasangPencarian();
  try {
    const resp = await fetch("data.json");
    if (!resp.ok) throw new Error("status " + resp.status);
    const d = await resp.json();
    jumlahBerkasJudul = d.berkasJudul;
    daftarSubjek = d.daftarSubjek;
    document.getElementById("a-total").textContent = fmt(d.total);
    document.getElementById("a-judul").textContent = fmt(d.totalJudul);
    document.getElementById("a-subjek").textContent = fmt(d.totalSubjek);
    document.getElementById("a-epustaka").textContent = fmt(d.totalEpustaka);
    renderBulan(d.perBulan);
    renderTop10(d.top10);
    renderSubjek(d.perSubjek);
    renderEpustaka(d.perEpustaka);
  } catch (err) {
    document.getElementById("gagal-data").hidden = false;
  }
}

mulai();
