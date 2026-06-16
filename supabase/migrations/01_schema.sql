-- DB Migrations: 01_schema.sql
-- Pacheca Web Database Schema Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('administrator', 'employee', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 3. ROLE PERMISSIONS
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('administrator', 'employee', 'client')),
    permission TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_role_permission UNIQUE (role, permission)
);

-- 4. CUSTOMERS (Paper-directory replacement)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dni TEXT,
    phone TEXT,
    whatsapp TEXT NOT NULL,
    email TEXT,
    address TEXT,
    birth_date DATE,
    credit_limit NUMERIC(12,2) DEFAULT 0.00,
    balance NUMERIC(12,2) DEFAULT 0.00, -- Calculated dynamically but stored for fast reads
    status TEXT NOT NULL DEFAULT 'al_dia' CHECK (status IN ('al_dia', 'proximo_a_vencer', 'vencido', 'bloqueado')),
    notes TEXT,
    labels TEXT[], -- array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 5. SUPPLIERS (Internal-only)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug_internal TEXT NOT NULL UNIQUE,
    website TEXT,
    catalog_url TEXT,
    contact_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    private_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    requires_login BOOLEAN DEFAULT FALSE,
    minimum_type TEXT NOT NULL DEFAULT 'sin_mimo' CHECK (minimum_type IN ('monto_minimo', 'cantidad_prendas', 'monto_y_cantidad', 'monto_segun_envio', 'sin_minimo', 'pendiente_confirmacion')),
    minimum_amount NUMERIC(12,2) DEFAULT 0.00,
    minimum_items INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'ARS',
    tax_included BOOLEAN DEFAULT TRUE,
    tax_percentage NUMERIC(5,2) DEFAULT 21.00,
    additional_costs NUMERIC(12,2) DEFAULT 0.00,
    estimated_shipping_cost NUMERIC(12,2) DEFAULT 0.00,
    estimated_delay_days INTEGER DEFAULT 7,
    conditions_summary TEXT,
    default_markup_percentage NUMERIC(6,2) DEFAULT 50.00, -- default mark up (e.g. 50% = 1.5x cost)
    import_method TEXT DEFAULT 'csv' CHECK (import_method IN ('manual', 'csv', 'excel', 'url_scraper')),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'ok',
    sync_frequency TEXT DEFAULT 'manual',
    exchange_policy TEXT,
    internal_rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    name_original TEXT, -- supplier name
    name_public TEXT NOT NULL, -- public Pacheca name
    code_original TEXT, -- supplier SKU
    code_public TEXT NOT NULL UNIQUE, -- Pacheca neutral SKU (e.g. PAC-0001)
    slug_public TEXT NOT NULL UNIQUE,
    url_original TEXT, -- supplier URL
    description_original TEXT,
    description_public TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory TEXT,
    tags TEXT[],
    price_original NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- wholesale cost
    currency TEXT DEFAULT 'ARS',
    tax_percentage NUMERIC(5,2) DEFAULT 21.00,
    assigned_shipping_cost NUMERIC(12,2) DEFAULT 0.00,
    other_costs NUMERIC(12,2) DEFAULT 0.00,
    cost_total NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- price_original + tax + shipping + other
    markup_percentage NUMERIC(6,2) DEFAULT 50.00,
    markup_fixed NUMERIC(12,2) DEFAULT 0.00,
    price_final NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- calculated public price
    price_promo NUMERIC(12,2),
    promo_ends_at TIMESTAMP WITH TIME ZONE,
    estimated_profit NUMERIC(12,2) DEFAULT 0.00,
    stock_total INTEGER DEFAULT 0,
    availability TEXT NOT NULL DEFAULT 'disponible' CHECK (availability IN ('disponible', 'disponible_en_local', 'por_encargo', 'pendiente_de_confirmacion', 'poca_disponibilidad', 'agotado', 'preventa')),
    estimated_delivery_weeks INTEGER DEFAULT 2,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES profiles(id),
    import_status TEXT,
    change_history JSONB[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url_original TEXT, -- provider hotlink (admin-only)
    url_public TEXT NOT NULL, -- Pacheca self-served cleaned image
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    sku_variant TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_variant UNIQUE (product_id, size, color)
);

-- 10. PRICING RULES
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 10,
    target_type TEXT NOT NULL CHECK (target_type IN ('general', 'supplier', 'category', 'product')),
    target_id UUID, -- NULL if general
    markup_percentage NUMERIC(6,2),
    markup_fixed NUMERIC(12,2),
    rounding_method TEXT NOT NULL DEFAULT 'sin_redondeo' CHECK (rounding_method IN ('sin_redondeo', 'a_100', 'a_500', 'a_1000', 'terminado_900', 'personalizado')),
    rounding_value INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. PROMOTIONS
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    discount_percentage NUMERIC(5,2),
    discount_fixed NUMERIC(12,2),
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CARTS
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE, -- for guest carts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    selected_size TEXT,
    selected_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    code_public TEXT NOT NULL UNIQUE, -- Pacheca customer order SKU
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    advance_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- down payment (anticipo)
    remaining_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('retiro_local', 'envio_domicilio', 'envio_correo')),
    shipping_address TEXT,
    customer_notes TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    status_internal TEXT NOT NULL DEFAULT 'borrador' CHECK (status_internal IN ('borrador', 'reservado', 'esperando_minimo', 'ronda_cerrada', 'pendiente_de_pago', 'pedido_al_proveedor', 'recibido_parcial', 'recibido', 'listo_para_retirar', 'enviado', 'entregado', 'cancelado', 'reintegrado')),
    status_public TEXT NOT NULL DEFAULT 'reserva_recibida' CHECK (status_public IN ('reserva_recibida', 'pendiente_de_confirmacion', 'pedido_confirmado', 'en_preparacion', 'en_camino', 'recibido_en_pacheca', 'listo_para_retirar', 'enviado', 'entregado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- 15. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price_unit_cost NUMERIC(12,2) NOT NULL, -- internal cost of item (admin only)
    price_unit_final NUMERIC(12,2) NOT NULL, -- public price paid by customer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. PURCHASE ROUNDS (Group buy rounds)
CREATE TABLE IF NOT EXISTS purchase_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    code_round TEXT UNIQUE NOT NULL, -- e.g. SYES-ROUND-005
    minimum_type TEXT NOT NULL,
    minimum_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    minimum_items INTEGER NOT NULL DEFAULT 0,
    accumulated_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    accumulated_items INTEGER NOT NULL DEFAULT 0,
    amount_needed NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    items_needed INTEGER NOT NULL DEFAULT 0,
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'minimo_alcanzado', 'pendiente_de_revision', 'cerrada', 'pedido_realizado', 'enviado_por_proveedor', 'recibido_parcial', 'recibido', 'finalizada', 'cancelada')),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_closed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    history JSONB[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. PURCHASE ROUND ITEMS (Links individual orders to a round)
CREATE TABLE IF NOT EXISTS purchase_round_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES purchase_rounds(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'out_of_stock', 'replaced')),
    replacement_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. SUPPLIER ORDERS (Consolidated admin purchase orders)
CREATE TABLE IF NOT EXISTS supplier_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES purchase_rounds(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    code_supplier_order TEXT UNIQUE NOT NULL, -- e.g. ORD-SYES-2026-001
    total_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_items INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'placed', 'shipped', 'received_partial', 'received_full', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE,
    estimated_arrival DATE,
    received_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. SUPPLIER ORDER ITEMS (Consolidated items)
CREATE TABLE IF NOT EXISTS supplier_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_order_id UUID NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
    quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
    unit_cost_price NUMERIC(12,2) NOT NULL,
    total_cost_price NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'out_of_stock', 'replaced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. LEDGER ENTRIES (Double-entry accounting log for customers current accounts)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL CHECK (type IN ('compra', 'pago', 'anticipo', 'cuota', 'recargo', 'descuento', 'devolucion', 'ajuste', 'anulacion', 'credito_a_favor')),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL, -- positive for client debt increase (purchase/fees), negative for credit/payments
    balance_before NUMERIC(12,2) NOT NULL,
    balance_after NUMERIC(12,2) NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'vigente' CHECK (status IN ('vigente', 'anulado', 'compensado')),
    reference_id TEXT, -- e.g. order_id, payment_id
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason_for_edit TEXT,
    related_entry_id UUID REFERENCES ledger_entries(id)
);

-- 21. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'mercadopago', 'tarjeta_credito', 'tarjeta_debito', 'otro')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    receipt_code TEXT,
    receipt_image_url TEXT, -- reference to attachment
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. INSTALLMENTS (Cuotas de compras)
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    ledger_entry_id UUID NOT NULL REFERENCES ledger_entries(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount NUMERIC(12,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagado', 'vencido', 'parcial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. LATE FEE RULES (Intereses de mora)
CREATE TABLE IF NOT EXISTS late_fee_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    percentage_after_due NUMERIC(5,2) DEFAULT 0.00,
    fixed_amount_fee NUMERIC(12,2) DEFAULT 0.00,
    grace_days INTEGER DEFAULT 0,
    recurring_percentage NUMERIC(5,2) DEFAULT 0.00,
    recurring_interval_days INTEGER DEFAULT 30,
    max_accumulated_percentage NUMERIC(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. ATTACHMENTS
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- e.g. 'payment', 'customer', 'supplier_import'
    entity_id UUID NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 25. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reserva_recibida', 'anticipo_confirmado', 'pedido_confirmado', 'compra_completada', 'en_preparacion', 'en_camino', 'producto_recibido', 'listo_para_retirar', 'proximo_vencimiento', 'cuenta_vencida', 'pago_registrado', 'system_alert')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    reference_id TEXT, -- e.g. order_id, invoice_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 26. SUPPLIER IMPORTS
CREATE TABLE IF NOT EXISTS supplier_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    imported_by UUID,
    filename TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 27. IMPORT ITEMS
CREATE TABLE IF NOT EXISTS import_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_id UUID NOT NULL REFERENCES supplier_imports(id) ON DELETE CASCADE,
    product_code_original TEXT,
    product_name_original TEXT,
    price_original_detected NUMERIC(12,2),
    stock_detected INTEGER,
    size_detected TEXT,
    color_detected TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'modified_by_supplier', 'no_stock', 'deleted_in_origin', 'requires_review')),
    comparison_data JSONB, -- stores { old_price, new_price, old_stock, new_stock, etc. }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 28. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- NULL for system / guest actions
    user_email TEXT,
    action_type TEXT NOT NULL, -- e.g. 'CREATE', 'UPDATE', 'DELETE', 'PRICE_CHANGE', 'PAYMENT', 'ADMIN_LOGIN'
    entity_name TEXT NOT NULL, -- e.g. 'products', 'customers', 'payments'
    entity_id UUID,
    previous_values JSONB,
    new_values JSONB,
    reason TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 29. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_code_public ON products(code_public);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status_internal);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_customer ON ledger_entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_rounds_supplier ON purchase_rounds(supplier_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
