import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase'; // Pastikan path ini sama dengan file sebelumnya
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Menerima data judul dan artis yang dikirim pengguna
    const body = await request.json();
    const { judul, artis } = body;

    if (!judul || !artis) {
      return NextResponse.json({ error: "Judul dan artis wajib diisi!" }, { status: 400 });
    }

    // Merancang Prompt untuk Gemini (Prompt Engineering)
    // PERBAIKAN: Menambahkan escape character (\) pada backtick agar tidak memotong string JS
    const prompt = `Berikan lirik lengkap dan 1 fakta budaya pop yang sangat menarik tentang lagu "${judul}" dari penyanyi "${artis}". 
    Balas HANYA menggunakan format JSON murni seperti di bawah ini, tanpa menggunakan blockquote (\`\`\`) atau teks markdown lainnya:
    {
      "lirik": "teks lirik baris pertama\\nbaris kedua...",
      "fakta_pop": "fakta unik disini...",
      "tahun_rilis": 2020
    }`;

    // Memanggil Gemini 1.5 Flash (sangat cepat untuk teks)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // PERBAIKAN: Menyatukan baris Regex agar syntax JS tidak error
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(cleanJson);

    // Menyimpan hasil dari AI langsung ke database Supabase
    const { data, error } = await supabase.from('lagu_pop').insert([
      {
        judul: judul,
        artis: artis,
        lirik: aiData.lirik,
        fakta_pop: aiData.fakta_pop,
        tahun_rilis: aiData.tahun_rilis
      }
    ]).select();

    if (error) throw error;

    return NextResponse.json({
      status: "sukses",
      pesan: "Lagu berhasil di-generate oleh AI dan disimpan ke Database!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Gagal memproses lagu", detail: error.message }, { status: 500 });
  }
}