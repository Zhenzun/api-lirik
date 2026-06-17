import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase'; // Pastikan path ini sesuai dengan struktur folder Anda

export async function POST(request) {
  try {
    const body = await request.json();
    const { judul, artis, lirik, fakta_pop, tahun_rilis } = body;

    // Validasi keamanan lapis kedua di sisi server
    if (!judul || !artis || !lirik) {
      return NextResponse.json({ error: "Data tidak lengkap dari aplikasi!" }, { status: 400 });
    }

    // Bypass AI dan langsung simpan ke Supabase
    const { data, error } = await supabase.from('lagu_pop').insert([
      {
        judul: judul,
        artis: artis,
        lirik: lirik,
        fakta_pop: fakta_pop,
        tahun_rilis: tahun_rilis
      }
    ]).select();

    if (error) throw error;

    return NextResponse.json({
      status: "sukses",
      pesan: "Lagu berhasil ditambahkan secara manual!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Simpan Manual:", error);
    return NextResponse.json({ error: "Gagal menyimpan ke database", detail: error.message }, { status: 500 });
  }
}