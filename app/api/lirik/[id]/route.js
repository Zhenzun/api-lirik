import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// FUNGSI HAPUS (DELETE)
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const { error } = await supabase.from('lagu_pop').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ status: "sukses", pesan: "Lagu dihapus" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// FUNGSI EDIT (PUT)
export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  try {
    const { error } = await supabase.from('lagu_pop').update(body).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ status: "sukses", pesan: "Lagu diperbarui" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}