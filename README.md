# appropa

Esta va a ser la nueva base desde la cuál vas a trabajar. porque la anterior tenía bastantes errores e información basura o innecesaria.

una vez que clonaste el repo. haces npm install, una vez instalado, haces npm run dev.. dejas la pág ahi mientras.

ahora vas a ir a la página de supabase, creas un nuevo proyecto.(recomendable si lo haces de sao paulo es lo más cerca). una vez creado vas a project overview. clickeas donde dice copy. se te abre un modal. copias donde dice project url. eso que copiaste lo pegas en tu archivo .env.local.. NEXT_PUBLIC_SUPABASE_URL=aca tu project url
Después vas a project settings(debajo de todo es una ruedita) vas a donde dice api keys. clickeas donde dice legacy anon,service_role api Keys. copias la anon public. y lo pegas en tu .env.local. NEXT_PUBLIC_SUPABASE_ANON_KEY=acá tu anon key..

ahora vas a sql editor en el dashboard. en tu carpeta supabase/migrations. copia todo lo que está dentro del archivo 01_schema.sql. y lo pegas en el sql editor, presionas el botón run.


ahora vas a tu página levantada(localhost:3000) te registras normalmente como cliente. una vez registrada. vas a la página de supabase en el dashboard clickeas en  table editor. bajas hasta donde dice  user_roles. en el rol donde dice cliente pones administrator guardas y cerras. ahora vas a tu página, recarga y deberías poder acceder al panel admin.

lo del login con dni lo saqué por seguridad.

