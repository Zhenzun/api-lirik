import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { judul, artis } = body;

    if (!judul || !artis) {
      return NextResponse.json({ error: "Judul dan artis wajib diisi!" }, { status: 400 });
    }

    // Menggunakan alias universal agar Google memilihkan versi stabil terbaru
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Berikan lirik lengkap dan 1 fakta budaya pop yang sangat menarik tentang lagu "${judul}" dari penyanyi "${artis}". 
    Balas HANYA menggunakan format JSON murni seperti di bawah ini, tanpa menggunakan blockquote (\`\`\`) atau teks markdown lainnya:
    {
      "lirik": "teks lirik baris pertama\\nbaris kedua...",
      "fakta_pop": "fakta unik disini...",
      "tahun_rilis": 2020
    }`;

    let aiData;

    try {
      // Mencoba memanggil AI
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiData = JSON.parse(cleanJson);
    } catch (aiError) {
      console.warn("AI sedang down/sibuk, menggunakan data Rencana B...");
      // FALLBACK: Jika AI Google error/503, gunakan data darurat ini agar aplikasi tidak crash
      aiData = {
        lirik: "Lirik tidak dapat ditarik saat ini karena server AI sedang sibuk. Silakan edit manual nanti.",
        fakta_pop: "Fakta pop belum tersedia.",
        tahun_rilis: new Date().getFullYear()
      };
    }

    // Menyimpan ke Supabase (baik data dari AI maupun data darurat)
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
      pesan: aiData.lirik.includes("server AI sedang sibuk") 
        ? "Tersimpan dengan Data Darurat (AI Down)" 
        : "Lagu berhasil di-generate AI dan disimpan!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Sistem:", error);
    return NextResponse.json({ error: "Gagal memproses lagu", detail: error.message }, { status: 500 });
  }
}