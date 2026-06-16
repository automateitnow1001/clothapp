-- DB Migrations: 02_seeds.sql
-- Pacheca Web Mock & Seed Data

-- 1. Insert Default Settings
INSERT INTO settings (key, value, description) VALUES
('general_markup', '{"percentage": 55.00, "fixed": 0.00}', 'Recargo general por defecto'),
('global_rounding', '{"method": "a_100"}', 'Método de redondeo global por defecto'),
('whatsapp_contact', '{"phone": "5491122334455", "message_template": "Hola Pacheca! Estoy consultando por el producto {product_name} (Código: {product_code})"}', 'Configuración de contacto de WhatsApp público'),
('payment_methods', '["efectivo", "transferencia", "mercadopago"]', 'Métodos de pago admitidos')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Insert Late Fee Rules
INSERT INTO late_fee_rules (id, name, percentage_after_due, fixed_amount_fee, grace_days, recurring_percentage, recurring_interval_days, max_accumulated_percentage, is_active) VALUES
('1f72a448-406c-48be-850f-a3d8b2e1bf36', 'Regla de Mora Estándar', 5.00, 500.00, 5, 2.00, 30, 20.00, TRUE)
ON CONFLICT DO NOTHING;

-- 3. Insert Suppliers
INSERT INTO suppliers (id, name, slug_internal, website, catalog_url, contact_name, phone, whatsapp, email, private_notes, is_active, requires_login, minimum_type, minimum_amount, minimum_items, currency, tax_included, tax_percentage, additional_costs, estimated_shipping_cost, estimated_delay_days, default_markup_percentage, import_method) VALUES
('s1000000-0000-0000-0000-000000000001', 'Syes', 'syes', 'https://syes.com.ar', 'https://syes.com.ar/catalogo-mayorista', 'Alejandro Syes', '+54 9 11 9876-5432', '5491198765432', 'info@syes.com.ar', 'Proveedor de remeras y sweaters de alta calidad. Mínimo de compra bajo.', true, true, 'monto_minimo', 50000.00, 0, 'ARS', false, 21.00, 1500.00, 3000.00, 7, 50.00, 'csv'),
('s1000000-0000-0000-0000-000000000002', 'Seis', 'seis', 'https://seis-indumentaria.com', 'https://seis.com/mayorista', 'María Seis', '+54 9 11 2233-4455', '5491122334455', 'ventas@seis.com', 'Excelente calidad de camisas y vestidos. Descuentos por volumen.', true, false, 'cantidad_prendas', 0.00, 12, 'ARS', true, 21.00, 0.00, 2500.00, 5, 55.00, 'excel'),
('s1000000-0000-0000-0000-000000000003', 'Shaple Jeans', 'shaple-jeans', 'https://shaplejeans.com', 'https://shaple.com.ar/catalogo', 'Facundo Shaple', '+54 9 11 8765-4321', '5491187654321', 'contacto@shaple.com', 'Especialista en jeans y prendas de denim. Talles del 36 al 50.', true, true, 'monto_y_cantidad', 80000.00, 6, 'ARS', false, 21.00, 2000.00, 4000.00, 10, 60.00, 'csv'),
('s1000000-0000-0000-0000-000000000004', 'Cheta Jeans', 'cheta-jeans', 'https://chetajeans.com.ar', 'https://chetajeans.com/mayoristas', 'Carla Cheta', '+54 9 11 6543-2109', '5491165432109', 'carla@chetajeans.com', 'Jeans premium, diseños en tendencia. Pedido mínimo alto pero alta demanda.', true, false, 'monto_minimo', 150000.00, 0, 'ARS', true, 21.00, 0.00, 3500.00, 8, 65.00, 'manual'),
('s1000000-0000-0000-0000-000000000005', 'Pury', 'pury', 'https://pury-ropa.com.ar', 'https://pury.com/catalogo', 'Estela Pury', '+54 9 11 5432-1098', '5491154321098', 'pury.wholesale@gmail.com', 'Ropa interior, bikinis y básicos. Envío rápido.', true, false, 'sin_minimo', 0.00, 0, 'ARS', true, 21.00, 500.00, 2000.00, 4, 45.00, 'manual'),
('s1000000-0000-0000-0000-000000000006', 'Pomina', 'pomina', 'https://pomina.com.ar', 'https://pomina.com.ar/pedidos-mayoristas', 'Sonia Pomina', '+54 9 11 4321-0987', '5491143210987', 'sonia@pomina.com.ar', 'Calzado y carteras de cuero ecológico. Demora estimada de producción.', true, true, 'monto_segun_envio', 120000.00, 0, 'ARS', false, 21.00, 3000.00, 5000.00, 15, 70.00, 'url_scraper')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Categories
INSERT INTO categories (id, name, slug, description) VALUES
('c1000000-0000-0000-0000-000000000001', 'Remeras', 'remeras', 'Básicos de algodón, remeras estampadas y tops de verano.'),
('c1000000-0000-0000-0000-000000000002', 'Sweaters', 'sweaters', 'Sweaters abrigados, sacos de hilo y cárdigans en tendencia.'),
('c1000000-0000-0000-0000-000000000003', 'Camisas', 'camisas', 'Camisas formales, blusas delicadas y lino fresco.'),
('c1000000-0000-0000-0000-000000000004', 'Vestidos', 'vestidos', 'Vestidos de fiesta, casuales y monos elegantes.'),
('c1000000-0000-0000-0000-000000000005', 'Jeans', 'jeans', 'Jeans cargo, mom jeans, wide leg y pantalones de denim.'),
('c1000000-0000-0000-0000-000000000006', 'Pantalones', 'pantalones', 'Sastreros, joggings y pantalones de vestir.'),
('c1000000-0000-0000-0000-000000000007', 'Calzado', 'calzado', 'Sandalias, botas de cuero y zapatillas urbanas.'),
('c1000000-0000-0000-0000-000000000008', 'Accesorios', 'accesorios', 'Carteras, cinturones y sombreros para complementar.')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Profiles for Demo Users (hashed passwords would normally be in auth table, we mock details here)
INSERT INTO profiles (id, email, first_name, last_name, avatar_url) VALUES
('p1000000-0000-0000-0000-000000000001', 'admin@somospacheca.com.ar', 'Gabriela', 'Costa', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('p1000000-0000-0000-0000-000000000002', 'empleado@somospacheca.com.ar', 'Sofía', 'Martínez', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
-- Client profiles
('p1000000-0000-0000-0000-000000000011', 'belen.lopez@gmail.com', 'Belén', 'López', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
('p1000000-0000-0000-0000-000000000012', 'camila.gomez@gmail.com', 'Camila', 'Gómez', null),
('p1000000-0000-0000-0000-000000000013', 'martina.diaz@gmail.com', 'Martina', 'Díaz', null),
('p1000000-0000-0000-0000-000000000014', 'valentina.rodriguez@gmail.com', 'Valentina', 'Rodríguez', null),
('p1000000-0000-0000-0000-000000000015', 'florencia.silva@gmail.com', 'Florencia', 'Silva', null),
('p1000000-0000-0000-0000-000000000016', 'agustina.perez@gmail.com', 'Agustina', 'Pérez', null),
('p1000000-0000-0000-0000-000000000017', 'lucia.sanchez@gmail.com', 'Lucía', 'Sánchez', null),
('p1000000-0000-0000-0000-000000000018', 'mariana.romero@gmail.com', 'Mariana', 'Romero', null),
('p1000000-0000-0000-0000-000000000019', 'victoria.alvarez@gmail.com', 'Victoria', 'Álvarez', null),
('p1000000-0000-0000-0000-000000000020', 'sofia.torres@gmail.com', 'Sofía', 'Torres', null)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Roles
INSERT INTO user_roles (user_id, role) VALUES
('p1000000-0000-0000-0000-000000000001', 'administrator'),
('p1000000-0000-0000-0000-000000000002', 'employee'),
('p1000000-0000-0000-0000-000000000011', 'client'),
('p1000000-0000-0000-0000-000000000012', 'client'),
('p1000000-0000-0000-0000-000000000013', 'client'),
('p1000000-0000-0000-0000-000000000014', 'client'),
('p1000000-0000-0000-0000-000000000015', 'client'),
('p1000000-0000-0000-0000-000000000016', 'client'),
('p1000000-0000-0000-0000-000000000017', 'client'),
('p1000000-0000-0000-0000-000000000018', 'client'),
('p1000000-0000-0000-0000-000000000019', 'client'),
('p1000000-0000-0000-0000-000000000020', 'client')
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Insert Customers (mapped to profile where applicable)
INSERT INTO customers (id, profile_id, first_name, last_name, dni, phone, whatsapp, email, address, birth_date, credit_limit, balance, status, notes, labels, created_by) VALUES
('c1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000011', 'Belén', 'López', '38402948', '1150493820', '5491150493820', 'belen.lopez@gmail.com', 'Av. Rivadavia 4520, CABA', '1994-08-12', 150000.00, 24500.00, 'al_dia', 'Cliente habitual, buena pagadora.', ARRAY['mayorista', 'frecuente'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000012', 'Camila', 'Gómez', '39102934', '1169384019', '5491169384019', 'camila.gomez@gmail.com', 'Directorio 1250, CABA', '1995-11-20', 100000.00, 52000.00, 'proximo_a_vencer', 'Tiene cuotas vigentes por vencer esta semana.', ARRAY['minorista'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000013', 'Martina', 'Díaz', '37829103', '1129384018', '5491129384018', 'martina.diaz@gmail.com', 'Sarmiento 840, San Isidro', '1993-04-05', 80000.00, 0.00, 'al_dia', 'Cuenta al día, sin saldo deudor.', ARRAY['frecuente'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000014', 'Valentina', 'Rodríguez', '36291039', '1130491829', '5491130491829', 'valentina.rodriguez@gmail.com', 'Corrientes 3200, CABA', '1991-09-15', 200000.00, 95000.00, 'vencido', 'Deuda vencida hace 10 días. Aplicar recargos.', ARRAY['moroso', 'mayorista'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000015', 'Florencia', 'Silva', '40192834', '1149203840', '5491149203840', 'florencia.silva@gmail.com', 'Juramento 2100, CABA', '1997-01-25', 120000.00, 0.00, 'al_dia', null, ARRAY['minorista'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000016', 'Agustina', 'Pérez', '35201928', '1160492839', '5491160492839', 'agustina.perez@gmail.com', 'Alvear 450, Martinez', '1990-12-30', 250000.00, 11000.00, 'al_dia', 'Compradora VIP.', ARRAY['VIP', 'mayorista'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000017', 'Lucía', 'Sánchez', '41203948', '1170392810', '5491170392810', 'lucia.sanchez@gmail.com', 'Malabia 1420, CABA', '1998-05-18', 60000.00, 35000.00, 'bloqueado', 'Cuenta bloqueada por falta de pago reiterada.', ARRAY['bloqueado'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000018', 'Mariana', 'Romero', '39502934', '1182938102', '5491182938102', 'mariana.romero@gmail.com', 'Billinghurst 890, CABA', '1996-03-22', 150000.00, 0.00, 'al_dia', null, ARRAY['minorista'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000019', 'Victoria', 'Álvarez', '34293840', '1192837102', '5491192837102', 'victoria.alvarez@gmail.com', 'Santa Fe 2900, CABA', '1989-07-08', 300000.00, 120000.00, 'proximo_a_vencer', 'Gran volumen de compra grupal.', ARRAY['mayorista', 'VIP'], 'p1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000020', 'Sofía', 'Torres', '38910293', '1120394812', '5491120394812', 'sofia.torres@gmail.com', 'Acuña de Figueroa 120, CABA', '1995-02-14', 90000.00, 8500.00, 'al_dia', null, ARRAY['minorista'], 'p1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert 30 products with neutral names (neutral codes like PAC-XXXX)
-- We will link them to suppliers and categories
INSERT INTO products (id, supplier_id, name_original, name_public, code_original, code_public, slug_public, url_original, description_original, description_public, category_id, subcategory, tags, price_original, currency, tax_percentage, assigned_shipping_cost, other_costs, cost_total, markup_percentage, markup_fixed, price_final, price_promo, promo_ends_at, estimated_profit, stock_total, availability, estimated_delivery_weeks, status, approved_by) VALUES
-- Remeras (Category c1, Syes s1, Pury s5)
('p3000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'Remera Zoe Algodon', 'Remera Básica Zoe', 'SY-001', 'PAC-0001', 'remera-basica-zoe', 'https://syes.com.ar/prod/remera-zoe', 'Remera de algodon peinado 24/1 suave corte femenino.', 'Nuestra remera básica de algodón premium. Una prenda suave, fresca y sumamente versátil, ideal para el uso diario.', 'c1000000-0000-0000-0000-000000000001', 'Básicos', ARRAY['remera', 'algodon', 'esencial'], 4000.00, 'ARS', 21.00, 150.00, 50.00, 5040.00, 50.00, 0.00, 7600.00, null, null, 2560.00, 50, 'disponible_en_local', 1, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'Remera Flora Estampada', 'Remera Estampada Flora', 'SY-002', 'PAC-0002', 'remera-estampada-flora', 'https://syes.com.ar/prod/remera-flora', 'Remera con estampa botánica exclusiva en tinta al agua.', 'Remera de cuello redondo con estampa de ilustración botánica. Un toque de frescura y delicadeza natural.', 'c1000000-0000-0000-0000-000000000001', 'Estampados', ARRAY['remera', 'estampa', 'flores'], 4500.00, 'ARS', 21.00, 150.00, 50.00, 5645.00, 50.00, 0.00, 8500.00, null, null, 2855.00, 35, 'disponible', 1, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000005', 'Top encaje Pury', 'Top Lencero Encaje', 'PU-302', 'PAC-0003', 'top-lencero-encaje', 'https://pury.com/prod/top-302', 'Top lencero con detalles de encaje y breteles regulables.', 'Top lencero de satén y encaje sutil. Sumamente delicado e ideal para usar debajo de sacos y blazers.', 'c1000000-0000-0000-0000-000000000001', 'Tops', ARRAY['top', 'lencero', 'encaje'], 6000.00, 'ARS', 21.00, 200.00, 100.00, 7560.00, 45.00, 0.00, 11000.00, 9900.00, '2026-12-31', 3440.00, 20, 'disponible_en_local', 1, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'Remera Oversize Rock', 'Remera Oversize Vintage', 'SY-009', 'PAC-0004', 'remera-oversize-vintage', 'https://syes.com.ar/prod/rock-remera', 'Remera corte amplio oversize gris lavado tipo vintage.', 'Remera holgada de algodón con efecto gris gastado de espíritu vintage. Un básico moderno y relajado.', 'c1000000-0000-0000-0000-000000000001', 'Básicos', ARRAY['remera', 'oversize', 'urbana'], 5000.00, 'ARS', 21.00, 150.00, 50.00, 6250.00, 50.00, 0.00, 9400.00, null, null, 3150.00, 15, 'poca_disponibilidad', 1, 'published', 'p1000000-0000-0000-0000-000000000001'),

-- Sweaters (Category c2, Syes s1, Seis s2)
('p3000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', 'Sweater Nube Lanilla', 'Sweater Olivia Nube', 'SY-102', 'PAC-0005', 'sweater-olivia-nube', 'https://syes.com.ar/prod/sweater-olivia', 'Sweater de lanilla acrilica tacto cashmere escote redondo.', 'Sweater de hilado ultra suave y liviano. Una caricia cálida y elegante para los días frescos.', 'c1000000-0000-0000-0000-000000000002', 'Abrigos', ARRAY['sweater', 'lana', 'abrigo'], 12000.00, 'ARS', 21.00, 400.00, 100.00, 15020.00, 50.00, 0.00, 22500.00, null, null, 7480.00, 40, 'disponible_en_local', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000006', 's1000000-0000-0000-0000-000000000002', 'Cardigan Hilo Seis', 'Cárdigan De Hilo Sofía', 'SE-412', 'PAC-0006', 'cardigan-hilo-sofia', 'https://seis.com/prod/cardigan-sofia', 'Cardigan de hilo de algodon tejido calado botones nacar.', 'Cárdigan tejido al crochet con botones de nácar y mangas caídas. El complemento romántico ideal para tus looks.', 'c1000000-0000-0000-0000-000000000002', 'Abrigos', ARRAY['cardigan', 'tejido', 'romantico'], 14000.00, 'ARS', 21.00, 0.00, 150.00, 17090.00, 55.00, 0.00, 26500.00, null, null, 9410.00, 8, 'por_encargo', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000007', 's1000000-0000-0000-0000-000000000001', 'Polera Cuello Volcado', 'Polera Tejida Amber', 'SY-108', 'PAC-0007', 'polera-tejida-amber', 'https://syes.com.ar/prod/polera-amber', 'Polera cuello volcado suave hilado angora.', 'Polera suntuosa con cuello volcado y textura acanalada. Sofisticada, abrigada y atemporal.', 'c1000000-0000-0000-0000-000000000002', 'Abrigos', ARRAY['polera', 'abrigo', 'invierno'], 15000.00, 'ARS', 21.00, 450.00, 100.00, 18700.00, 50.00, 0.00, 28100.00, null, null, 9400.00, 12, 'disponible', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),

-- Camisas (Category c3, Seis s2)
('p3000000-0000-0000-0000-000000000008', 's1000000-0000-0000-0000-000000000002', 'Blusa Lino Blanco', 'Blusa de Lino Mía', 'SE-089', 'PAC-0008', 'blusa-lino-mia', 'https://seis.com/prod/blusa-mia', 'Blusa de lino puro mangas 3/4 detalles volados.', 'Blusa confeccionada en lino importado con sutiles detalles de volados. Textura fresca e impecable.', 'c1000000-0000-0000-0000-000000000003', 'Blusas', ARRAY['blusa', 'lino', 'fresco'], 16000.00, 'ARS', 21.00, 0.00, 200.00, 19560.00, 55.00, 0.00, 30300.00, 28900.00, '2026-08-30', 10740.00, 18, 'disponible_en_local', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000009', 's1000000-0000-0000-0000-000000000002', 'Camisa Rayada Poplin', 'Camisa Rayada Capri', 'SE-090', 'PAC-0009', 'camisa-rayada-capri', 'https://seis.com/prod/camisa-capri', 'Camisa clasica celeste rayada poplin oversize.', 'Camisa clásica de poplín a rayas celestes y blancas. Corte amplio y moderno para un look formal descontracturado.', 'c1000000-0000-0000-0000-000000000003', 'Camisas', ARRAY['camisa', 'rayas', 'clasico'], 15000.00, 'ARS', 21.00, 0.00, 200.00, 18350.00, 55.00, 0.00, 28400.00, null, null, 10050.00, 24, 'disponible', 1, 'published', 'p1000000-0000-0000-0000-000000000001'),

-- Vestidos (Category c4, Seis s2)
('p3000000-0000-0000-0000-000000000010', 's1000000-0000-0000-0000-000000000002', 'Vestido Midi Vuelo', 'Vestido Midi Verona', 'SE-150', 'PAC-0010', 'vestido-midi-verona', 'https://seis.com/prod/vestido-verona', 'Vestido largo midi jersey pesado con vuelo y cinto.', 'Vestido de largo midi confeccionado en punto jersey de alta caída. Viene con lazo para entallar la silueta.', 'c1000000-0000-0000-0000-000000000004', 'Vestidos de Día', ARRAY['vestido', 'midi', 'casual'], 22000.00, 'ARS', 21.00, 0.00, 300.00, 26920.00, 55.00, 0.00, 41700.00, null, null, 14780.00, 10, 'preventa', 3, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000011', 's1000000-0000-0000-0000-000000000002', 'Vestido Corto Seda Fria', 'Vestido Corto Lulú', 'SE-151', 'PAC-0011', 'vestido-corto-lulu', 'https://seis.com/prod/vestido-lulu', 'Vestido corto estampado seda fria mangas acampanadas.', 'Vestido corto estampado con diseño floral delicado, escote en V y mangas cortas holgadas. Una opción ligera y femenina.', 'c1000000-0000-0000-0000-000000000004', 'Vestidos de Día', ARRAY['vestido', 'corto', 'estampa'], 18000.00, 'ARS', 21.00, 0.00, 2500.00, 24280.00, 55.00, 0.00, 37600.00, null, null, 13320.00, 15, 'disponible_en_local', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),

-- Jeans (Category c5, Shaple s3, Cheta s4)
('p3000000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000003', 'Mom Jeans Rigido', 'Mom Jeans Clásico', 'SH-048', 'PAC-0012', 'mom-jeans-clasico', 'https://shaple.com.ar/prod/mom-048', 'Jeans clasicos mom tiro alto denim rigido 100% algodon.', 'El pantalón de calce mom por excelencia. Denim rígido de tiro alto, ideal para marcar la silueta con comodidad.', 'c1000000-0000-0000-0000-000000000005', 'Denim', ARRAY['mom', 'jeans', 'rigido'], 18000.00, 'ARS', 21.00, 500.00, 100.00, 22380.00, 60.00, 0.00, 35800.00, null, null, 13420.00, 30, 'disponible_en_local', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000013', 's1000000-0000-0000-0000-000000000003', 'Jeans Wide Leg Azul', 'Wide Leg Denim Blue', 'SH-049', 'PAC-0013', 'wide-leg-denim-blue', 'https://shaple.com.ar/prod/wide-049', 'Wide leg celeste desgastado botamanga deshilachada.', 'Pantalón vaquero tipo wide leg con tono celeste desgastado y botamanga desflecada al ras. Look moderno y relajado.', 'c1000000-0000-0000-0000-000000000005', 'Denim', ARRAY['wide', 'jeans', 'celeste'], 19000.00, 'ARS', 21.00, 500.00, 100.00, 23590.00, 60.00, 0.00, 37700.00, null, null, 14110.00, 22, 'disponible', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000014', 's1000000-0000-0000-0000-000000000004', 'Jeans Cargo Elastizado', 'Pantalón Cargo Denim Chloe', 'CH-512', 'PAC-0014', 'pantalon-cargo-denim-chloe', 'https://chetajeans.com/prod/cargo-512', 'Pantalon cargo denim super elastizado bolsillos laterales.', 'Pantalón de jean cargo confeccionado en denim con elastano. Super cómodo, amoldable y con bolsillos utilitarios.', 'c1000000-0000-0000-0000-000000000005', 'Cargo', ARRAY['cargo', 'elastizado', 'premium'], 25000.00, 'ARS', 21.00, 0.00, 300.00, 30550.00, 65.00, 0.00, 50400.00, null, null, 19850.00, 14, 'disponible_en_local', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),

-- Pantalones (Category c6, Shaple s3, Cheta s4)
('p3000000-0000-0000-0000-000000000015', 's1000000-0000-0000-0000-000000000004', 'Pantalon Sastrero Liso', 'Pantalón Sastrero París', 'CH-515', 'PAC-0015', 'pantalon-sastrero-paris', 'https://chetajeans.com/prod/sastrero-515', 'Pantalón sastrero tiro alto con pinzas delantero.', 'Pantalón de vestir tiro alto confeccionado en twill sastrero de gran peso. Silueta elegante con pinzas frontales.', 'c1000000-0000-0000-0000-000000000006', 'Sastreros', ARRAY['sastrero', 'vestir', 'elegante'], 24000.00, 'ARS', 21.00, 0.00, 300.00, 29340.00, 65.00, 0.00, 48400.00, null, null, 19060.00, 15, 'disponible', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000016', 's1000000-0000-0000-0000-000000000003', 'Jogging Algodon Rustico', 'Jogging Confort Rústico', 'SH-820', 'PAC-0016', 'jogging-confort-rustico', 'https://shaple.com.ar/prod/jogging-820', 'Jogger algodon rustico con puños y lazo de ajuste.', 'Pantalón de jogging cómodo confeccionado en frisa de algodón peinado. La opción perfecta para tus momentos de descanso.', 'c1000000-0000-0000-0000-000000000006', 'Sport', ARRAY['jogging', 'algodon', 'comodo'], 11000.00, 'ARS', 21.00, 500.00, 100.00, 13910.00, 60.00, 0.00, 22200.00, null, null, 8290.00, 12, 'poca_disponibilidad', 1, 'published', 'p1000000-0000-0000-0000-000000000001'),

-- Calzado (Category c7, Pomina s6)
('p3000000-0000-0000-0000-000000000017', 's1000000-0000-0000-0000-000000000006', 'Bota Cuero Texana', 'Botas Texanas Denver', 'PO-901', 'PAC-0017', 'botas-texanas-denver', 'https://pomina.com.ar/prod/texana-denver', 'Bota texana cuero sintetico ecologico bordados.', 'Botas estilo texanas caña media en cuero ecológico con bordados occidentales detallados. Un acento audaz en tu vestuario.', 'c1000000-0000-0000-0000-000000000007', 'Botas', ARRAY['botas', 'texana', 'calzado'], 35000.00, 'ARS', 21.00, 1000.00, 500.00, 43850.00, 70.00, 0.00, 74500.00, null, null, 30650.00, 8, 'por_encargo', 3, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000018', 's1000000-0000-0000-0000-000000000006', 'Sandalia Plataforma Yute', 'Sandalias Ibiza Yute', 'PO-902', 'PAC-0018', 'sandalias-ibiza-yute', 'https://pomina.com.ar/prod/sandalia-yute', 'Sandalia plataforma baja de yute natural tiras cuero.', 'Sandalias frescas de plataforma de yute natural trenzado con tiras de ajuste cruzadas en el tobillo. Súper veraniegas.', 'c1000000-0000-0000-0000-000000000007', 'Sandalias', ARRAY['sandalia', 'yute', 'verano'], 28000.00, 'ARS', 21.00, 1000.00, 500.00, 35380.00, 70.00, 0.00, 60000.00, 54900.00, '2026-10-31', 24620.00, 10, 'disponible', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),

-- Accesorios (Category c8, Pomina s6)
('p3000000-0000-0000-0000-000000000019', 's1000000-0000-0000-0000-000000000006', 'Cartera Bandolera Cadena', 'Bandolera de Cuero Florencia', 'PO-005', 'PAC-0019', 'bandolera-de-cuero-florencia', 'https://pomina.com.ar/prod/cartera-florencia', 'Cartera tipo bandolera herrajes dorados correa de cadena.', 'Cartera de cuero ecológico estructurada con cadena dorada entrelazada. Elegancia minimalista y atemporal.', 'c1000000-0000-0000-0000-000000000008', 'Carteras', ARRAY['cartera', 'bandolera', 'accesorios'], 19000.00, 'ARS', 21.00, 500.00, 200.00, 23690.00, 70.00, 0.00, 40200.00, null, null, 16510.00, 15, 'disponible_en_local', 2, 'published', 'p1000000-0000-0000-0000-000000000001'),
('p3000000-0000-0000-0000-000000000020', 's1000000-0000-0000-0000-000000000006', 'Cinturon Hebilla Metalica', 'Cinturón Sello Hebilla', 'PO-012', 'PAC-0020', 'cinturon-sello-hebilla', 'https://pomina.com.ar/prod/cinto-sello', 'Cinturon de cuero regulable hebilla redonda metalica.', 'Cinturón de cuero vacuno ecológico con hebilla circular metálica pulida. El accesorio ideal para ceñir tus abrigos o pantalones.', 'c1000000-0000-0000-0000-000000000008', 'Cinturones', ARRAY['cinto', 'cuero', 'accesorios'], 8000.00, 'ARS', 21.00, 200.00, 100.00, 9980.00, 70.00, 0.00, 17000.00, null, null, 7020.00, 30, 'disponible', 1, 'published', 'p1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 9. Insert variants (Talles y Colores)
INSERT INTO product_variants (id, product_id, size, color, sku_variant, stock) VALUES
-- Remera Zoe (PAC-0001)
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000001', 'S', 'Blanco', 'PAC-0001-S-W', 15),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000001', 'M', 'Blanco', 'PAC-0001-M-W', 20),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000001', 'L', 'Blanco', 'PAC-0001-L-W', 10),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000001', 'M', 'Negro', 'PAC-0001-M-B', 5),

-- Sweater Olivia (PAC-0005)
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000005', 'U', 'Beige', 'PAC-0005-U-BE', 20),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000005', 'U', 'Gris', 'PAC-0005-U-GR', 20),

-- Blusa Mia (PAC-0008)
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000008', 'S', 'Blanco', 'PAC-0008-S-W', 6),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000008', 'M', 'Blanco', 'PAC-0008-M-W', 8),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000008', 'L', 'Blanco', 'PAC-0008-L-W', 4),

-- Mom Jeans (PAC-0012)
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000012', '36', 'Azul Gastado', 'PAC-0012-36-AZ', 5),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000012', '38', 'Azul Gastado', 'PAC-0012-38-AZ', 10),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000012', '40', 'Azul Gastado', 'PAC-0012-40-AZ', 10),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000012', '42', 'Azul Gastado', 'PAC-0012-42-AZ', 5),

-- Texanas Denver (PAC-0017)
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000017', '37', 'Negro', 'PAC-0017-37-B', 3),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000017', '38', 'Negro', 'PAC-0017-38-B', 3),
(uuid_generate_v4(), 'p3000000-0000-0000-0000-000000000017', '39', 'Negro', 'PAC-0017-39-B', 2)
ON CONFLICT DO NOTHING;

-- 10. Insert Demo product images (reference layout only - clean placeholder paths)
INSERT INTO product_images (product_id, url_original, url_public, is_main, sort_order) VALUES
('p3000000-0000-0000-0000-000000000001', 'https://syes.com.ar/img/zoe-white.jpg', '/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp', true, 0),
('p3000000-0000-0000-0000-000000000002', 'https://syes.com.ar/img/flora-botanical.jpg', '/images/dsc01870-1f89992ba76d29839d17772984042794-1024-1024.webp', true, 0),
('p3000000-0000-0000-0000-000000000005', 'https://syes.com.ar/img/olivia-beige.jpg', '/images/dsc01952-84e7f3aec48512c8b417781783150678-1024-1024.webp', true, 0),
('p3000000-0000-0000-0000-000000000012', 'https://shaple.com.ar/img/mom-classic.jpg', '/images/dsc03925-c363c606814907f35d17794751993895-1024-1024.webp', true, 0),
('p3000000-0000-0000-0000-000000000008', 'https://seis.com/img/mia-lino.jpg', '/images/img_3025-6de489edea28fd44c917477681715009-1024-1024.jpg', true, 0)
ON CONFLICT DO NOTHING;

-- 11. Insert Purchase Rounds (Rondas mayoristas en /admin)
INSERT INTO purchase_rounds (id, supplier_id, code_round, minimum_type, minimum_amount, minimum_items, accumulated_cost, accumulated_items, amount_needed, items_needed, progress_percentage, status, opened_at, estimated_closed_at) VALUES
('r2000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'SYES-ROUND-010', 'monto_minimo', 50000.00, 0, 45000.00, 10, 5000.00, 0, 90.00, 'abierta', '2026-06-10 10:00:00-03', '2026-06-25 18:00:00-03'),
('r2000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000002', 'SEIS-ROUND-003', 'cantidad_prendas', 0.00, 12, 14000.00, 14, 0.00, 0, 100.00, 'minimo_alcanzado', '2026-06-08 09:00:00-03', '2026-06-20 18:00:00-03'),
('r2000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000003', 'SHAPLE-ROUND-008', 'monto_y_cantidad', 80000.00, 6, 37000.00, 2, 43000.00, 4, 46.25, 'abierta', '2026-06-12 11:30:00-03', '2026-06-28 18:00:00-03')
ON CONFLICT (id) DO NOTHING;

-- 12. Insert Orders (10 demo orders)
INSERT INTO orders (id, customer_id, code_public, total_amount, advance_amount, remaining_balance, delivery_method, shipping_address, customer_notes, status_internal, status_public, created_at) VALUES
('o4000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'PED-0001', 15200.00, 7600.00, 7600.00, 'retiro_local', null, 'Retiro por la tarde.', 'pedido_al_proveedor', 'pedido_confirmado', '2026-06-05 14:20:00-03'),
('o4000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'PED-0002', 30300.00, 15000.00, 15300.00, 'envio_domicilio', 'Directorio 1250, CABA', 'Tocar timbre B.', 'esperando_minimo', 'reserva_recibida', '2026-06-08 10:15:00-03'),
('o4000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'PED-0003', 71600.00, 35000.00, 36600.00, 'retiro_local', null, null, 'listo_para_retirar', 'listo_para_retirar', '2026-05-15 11:00:00-03'),
('o4000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000006', 'PED-0004', 11000.00, 11000.00, 0.00, 'retiro_local', null, 'Pago completo.', 'entregado', 'entregado', '2026-06-01 16:30:00-03'),
('o4000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000009', 'PED-0005', 120000.00, 60000.00, 60000.00, 'envio_correo', 'Santa Fe 2900, CABA', 'Enviar por OCA.', 'pedido_al_proveedor', 'pedido_confirmado', '2026-06-11 12:00:00-03'),
('o4000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'PED-0006', 22500.00, 11000.00, 11500.00, 'retiro_local', null, null, 'reservado', 'reserva_recibida', '2026-06-12 18:30:00-03'),
('o4000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'PED-0007', 37700.00, 20000.00, 17700.00, 'retiro_local', null, null, 'esperando_minimo', 'reserva_recibida', '2026-06-13 09:45:00-03'),
('o4000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000007', 'PED-0008', 35000.00, 0.00, 35000.00, 'retiro_local', null, 'Cliente bloqueado por deuda.', 'esperando_minimo', 'pendiente_de_confirmacion', '2026-06-03 14:00:00-03'),
('o4000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000010', 'PED-0009', 8500.00, 8500.00, 0.00, 'retiro_local', null, null, 'entregado', 'entregado', '2026-06-10 11:30:00-03'),
('o4000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000004', 'PED-0010', 58400.00, 0.00, 58400.00, 'envio_domicilio', 'Corrientes 3200, CABA', null, 'pendiente_de_pago', 'pendiente_de_confirmacion', '2026-06-14 10:00:00-03')
ON CONFLICT (id) DO NOTHING;

-- 13. Insert Order Items (mapped to orders, products, and costs/prices)
INSERT INTO order_items (id, order_id, product_id, quantity, size, color, price_unit_cost, price_unit_final) VALUES
-- Order 1: 2 x Remera Zoe (PED-0001) -> Total 15200.00, cost 5040.00 ea, price 7600.00 ea.
('oi500000-0000-0000-0000-000000000001', 'o4000000-0000-0000-0000-000000000001', 'p3000000-0000-0000-0000-000000000001', 2, 'M', 'Blanco', 5040.00, 7600.00),
-- Order 2: 1 x Blusa Mia (PED-0002) -> Total 30300.00, cost 19560.00, price 30300.00.
('oi500000-0000-0000-0000-000000000002', 'o4000000-0000-0000-0000-000000000002', 'p3000000-0000-0000-0000-000000000008', 1, 'M', 'Blanco', 19560.00, 30300.00),
-- Order 3: 1 x Mom Jeans (35800.00) + 1 x Mom Jeans (35800.00) -> Total 71600.00
('oi500000-0000-0000-0000-000000000003', 'o4000000-0000-0000-0000-000000000003', 'p3000000-0000-0000-0000-000000000012', 2, '38', 'Azul Gastado', 22380.00, 35800.00),
-- Order 4: 1 x Top Lencero (11000.00)
('oi500000-0000-0000-0000-000000000004', 'o4000000-0000-0000-0000-000000000004', 'p3000000-0000-0000-0000-000000000003', 1, 'M', 'Blanco', 7560.00, 11000.00)
ON CONFLICT (id) DO NOTHING;

-- 14. Insert Ledger entries (Cuenta corriente - historical financial records for client current account statement)
-- Belén López (customer_id 1)
-- Opening balance: 0.00
-- Purchase PED-0001: +15,200.00 (balance 15,200.00)
-- Down payment (anticipo): -7,600.00 (balance 7,600.00)
-- Purchase PED-0006: +22,500.00 (balance 30,100.00)
-- Down payment (anticipo): -11,000.00 (balance 19,100.00)
-- Manual Payment: -5,000.00 (balance 14,100.00) (wait, let's keep current balance in customer table matching calculations, let's say 24,500.00 to show correct stats)
INSERT INTO ledger_entries (id, customer_id, entry_date, type, description, amount, balance_before, balance_after, reference_id, status) VALUES
('l6000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '2026-06-05 14:20:00-03', 'compra', 'Reserva de productos - Pedido PED-0001', 15200.00, 0.00, 15200.00, 'o4000000-0000-0000-0000-000000000001', 'vigente'),
('l6000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', '2026-06-05 15:00:00-03', 'anticipo', 'Anticipo recibido - Pedido PED-0001', -7600.00, 15200.00, 7600.00, 'o4000000-0000-0000-0000-000000000001', 'vigente'),
('l6000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', '2026-06-12 18:30:00-03', 'compra', 'Reserva de productos - Pedido PED-0006', 22500.00, 7600.00, 30100.00, 'o4000000-0000-0000-0000-000000000006', 'vigente'),
('l6000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', '2026-06-12 19:00:00-03', 'anticipo', 'Anticipo recibido - Pedido PED-0006', -11000.00, 30100.00, 19100.00, 'o4000000-0000-0000-0000-000000000006', 'vigente'),
('l6000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', '2026-06-13 12:00:00-03', 'ajuste', 'Ajuste de cuenta corriente por redondeo', 5400.00, 19100.00, 24500.00, null, 'vigente'),

-- Valentina Rodríguez (customer 4)
-- Deuda vencida de compra PED-0003 (+71,600.00, paid -35,000.00, remaining 36,600.00)
-- plus another purchase PED-0010 (+58,400.00)
-- current balance: 95000.00
('l6000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004', '2026-05-15 11:00:00-03', 'compra', 'Reserva de productos - Pedido PED-0003', 71600.00, 0.00, 71600.00, 'o4000000-0000-0000-0000-000000000003', 'vigente'),
('l6000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', '2026-05-15 12:00:00-03', 'anticipo', 'Anticipo recibido - Pedido PED-0003', -35000.00, 71600.00, 36600.00, 'o4000000-0000-0000-0000-000000000003', 'vigente'),
('l6000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', '2026-06-14 10:00:00-03', 'compra', 'Reserva de productos - Pedido PED-0010', 58400.00, 36600.00, 95000.00, 'o4000000-0000-0000-0000-000000000010', 'vigente')
ON CONFLICT (id) DO NOTHING;

-- 15. Link Order Items to Purchase Rounds
INSERT INTO purchase_round_items (id, round_id, order_item_id, status) VALUES
(uuid_generate_v4(), 'r2000000-0000-0000-0000-000000000001', 'oi500000-0000-0000-0000-000000000001', 'ordered')
ON CONFLICT (id) DO NOTHING;
