import { NextResponse } from 'next/server';
   import { supabase } from '../../lib/supabase';

   export async function GET() {
     // Mengambil semua data dari tabel lagu_pop
     const { data, error } = await supabase.from('lagu_pop').select('*');

     if (error) {
       return NextResponse.json({ status: "error", pesan: error.message }, { status: 500 });
     }

     return NextResponse.json({
       status: "sukses",
       total_data: data.length,
       data: data
     });
   }