import { createClient } from "@supabase/supabase-js";

// --- TypeScript Entity Definitions ---

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  whatsapp?: string | null;
  password?: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "administrator" | "employee" | "client";
}

export interface ClubMember {
  id: string;
  profile_id: string;
  points_balance: number;
  points_pending: number;
  referral_code: string;
  level: "Pacheca" | "Pacheca Plus" | "Pacheca VIP";
  birthday?: string;
  registered_at: string;
  notes?: string;
  is_blocked: boolean;
}

export interface PointTransaction {
  id: string;
  member_id: string;
  amount: number;
  action_type: "welcome" | "purchase" | "review" | "photo" | "referral_friend" | "referral_referrer" | "birthday" | "redemption" | "manual_adjust" | "cancel_order";
  status: "pendiente" | "acreditado" | "canjeado" | "vencido" | "cancelado" | "revertido";
  order_id?: string;
  description: string;
  created_at: string;
  expires_at?: string;
  admin_id?: string;
  reason?: string;
}

export interface Referral {
  id: string;
  referrer_member_id: string;
  friend_email: string;
  friend_phone?: string;
  friend_name?: string;
  referral_code: string;
  status: "invitado" | "registrado" | "compra_pendiente" | "compra_confirmada" | "beneficio_acreditado" | "compra_cancelada" | "beneficio_vencido";
  created_at: string;
  order_id?: string;
  friend_profile_id?: string;
}

export interface Coupon {
  id: string;
  code: string;
  member_id?: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping" | "free_gift";
  discount_value: number;
  min_purchase_amount: number;
  expires_at: string;
  is_used: boolean;
  used_order_id?: string;
  used_at?: string;
  created_at: string;
  description: string;
}

export interface ClubConfig {
  points_welcome: number;
  money_to_points_ratio: number;
  points_per_review: number;
  points_per_photo: number;
  points_per_referral: number;
  points_birthday_multiplier: number;
  points_expiry_days: number;
  min_purchase_for_referral_benefit: number;
  referral_discount_friend: number;
  referral_discount_referrer: number;
  referral_coupon_expiry_days: number;
  referrals_max_per_month: number;
  is_referral_discount_accumulable: boolean;
}

export interface ClubReward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  benefit_type: "percentage" | "fixed_amount" | "free_shipping" | "free_gift";
  benefit_value: number;
  min_purchase_amount: number;
  expires_days: number;
  stock: number;
  is_active: boolean;
  image_url?: string;
}

export interface ClientPhoto {
  id: string;
  member_id: string;
  image_url: string;
  product_id: string;
  size_used: string;
  comment?: string;
  authorized_publishing: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  points_awarded?: boolean;
}

export interface FraudAlert {
  id: string;
  type: "coincidencia_datos" | "multiples_cuentas" | "pago_rechazado" | "reincidencia_direccion";
  description: string;
  member_id?: string;
  referral_id?: string;
  status: "requiere_revision" | "aprobado" | "bloqueado";
  created_at: string;
}

export interface ClubNotification {
  id: string;
  member_id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_id?: string | null;
  product_name?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  size_purchased?: string;
  fit_opinion?: "small" | "perfect" | "large";
  recommend?: boolean;
  member_id?: string;
  order_id?: string;
  points_awarded?: boolean;
}

export interface Customer {
  id: string;
  profile_id?: string | null;
  first_name: string;
  last_name: string;
  dni?: string;
  phone?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  birth_date?: string;
  credit_limit: number;
  balance: number;
  status: "al_dia" | "proximo_a_vencer" | "vencido" | "bloqueado";
  notes?: string;
  labels: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  slug_internal: string;
  website?: string;
  catalog_url?: string;
  contact_name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  private_notes?: string;
  is_active: boolean;
  requires_login: boolean;
  minimum_type: "monto_minimo" | "cantidad_prendas" | "monto_y_cantidad" | "monto_segun_envio" | "sin_minimo" | "pendiente_confirmacion";
  minimum_amount: number;
  minimum_items: number;
  currency: string;
  tax_included: boolean;
  tax_percentage: number;
  additional_costs: number;
  estimated_shipping_cost: number;
  estimated_delay_days: number;
  conditions_summary?: string;
  default_markup_percentage: number;
  import_method: "manual" | "csv" | "excel" | "url_scraper";
  last_reviewed_at?: string;
  sync_status: string;
  sync_frequency: string;
  exchange_policy?: string;
  internal_rules?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  gender?: "mujer" | "hombre" | "unisex" | "telas";
  created_at: string;
}

export interface Product {
  id: string;
  supplier_id: string;
  name_original: string;
  name_public: string;
  code_original: string;
  code_public: string;
  slug_public: string;
  url_original?: string;
  description_original?: string;
  description_public?: string;
  category_id: string;
  subcategory?: string;
  tags: string[];
  price_original: number;
  currency: string;
  tax_percentage: number;
  assigned_shipping_cost: number;
  other_costs: number;
  cost_total: number;
  markup_percentage: number;
  markup_fixed: number;
  price_final: number;
  price_promo?: number | null;
  promo_ends_at?: string | null;
  estimated_profit: number;
  stock_total: number;
  availability: "disponible" | "disponible_en_local" | "por_encargo" | "pendiente_de_confirmacion" | "poca_disponibilidad" | "agotado" | "preventa";
  estimated_delivery_weeks: number;
  status: "draft" | "published" | "archived";
  approved_by?: string;
  approved_at?: string;
  product_type?: "indumentaria" | "telas";
  gender?: "mujer" | "hombre" | "unisex";
  round_id?: string | null;
  size_guide_text?: string;
  colors?: string[];
  images?: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku_variant?: string;
  stock: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url_original?: string;
  url_public: string;
  is_main: boolean;
  sort_order: number;
}

export interface CuratedLook {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_ids: string[];
  tags: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_published: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_id?: string | null;
  product_name?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface SizeGuide {
  id: string;
  size: string;
  bust_min: number;
  bust_max: number;
  waist_min: number;
  waist_max: number;
  hip_min: number;
  hip_max: number;
}

export interface Order {
  id: string;
  customer_id: string;
  code_public: string;
  total_amount: number;
  advance_amount: number;
  remaining_balance: number;
  delivery_method: "retiro_local" | "envio_domicilio" | "envio_correo";
  shipping_address?: string;
  customer_notes?: string;
  status_internal: "borrador" | "reservado" | "esperando_minimo" | "ronda_cerrada" | "pendiente_de_pago" | "pedido_al_proveedor" | "recibido_parcial" | "recibido" | "listo_para_retirar" | "enviado" | "entregado" | "cancelado" | "reintegrado";
  status_public: "reserva_recibida" | "pendiente_de_confirmacion" | "pedido_confirmado" | "en_preparacion" | "en_camino" | "recibido_en_pacheca" | "listo_para_retirar" | "enviado" | "entregado" | "cancelado";
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  size: string;
  color: string;
  price_unit_cost: number;
  price_unit_final: number;
}

export interface WorkShift {
  id: string;
  employee_id: string; // "p2" (Paola) or "p12" (Yamila)
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  hours: number;
  notes?: string;
  edit_count: number; // Max 2
  created_by: string; // Email
  created_at: string;
}

export interface PurchaseRound {
  id: string;
  supplier_id: string;
  code_round: string;
  minimum_type: string;
  minimum_amount: number;
  minimum_items: number;
  accumulated_cost: number;
  accumulated_items: number;
  amount_needed: number;
  items_needed: number;
  progress_percentage: number;
  status: "abierta" | "minimo_alcanzado" | "pendiente_de_revision" | "cerrada" | "pedido_realizado" | "enviado_por_proveedor" | "recibido_parcial" | "recibido" | "finalizada" | "cancelada";
  opened_at: string;
  estimated_closed_at?: string;
  closed_at?: string;
  notes?: string;
  history?: any[];
  created_at: string;
}

export interface PurchaseRoundItem {
  id: string;
  round_id: string;
  order_item_id: string;
  status: "pending" | "ordered" | "received" | "out_of_stock" | "replaced";
  replacement_notes?: string;
}

export interface LedgerEntry {
  id: string;
  customer_id: string;
  entry_date: string;
  type: "compra" | "pago" | "anticipo" | "cuota" | "recargo" | "descuento" | "devolucion" | "ajuste" | "anulacion" | "credito_a_favor";
  description: string;
  amount: number; // Positive increases balance (debt), negative decreases it
  balance_before: number;
  balance_after: number;
  due_date?: string;
  status: "vigente" | "anulado" | "compensated";
  reference_id?: string;
  created_by?: string;
  created_at: string;
  reason_for_edit?: string;
  related_entry_id?: string;
}

export interface Payment {
  id: string;
  customer_id: string;
  order_id?: string | null;
  amount: number;
  payment_method: "efectivo" | "transferencia" | "mercadopago" | "tarjeta_credito" | "tarjeta_debito" | "otro";
  payment_date: string;
  receipt_code?: string;
  receipt_image_url?: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface LateFeeRule {
  id: string;
  name: string;
  percentage_after_due: number;
  fixed_amount_fee: number;
  grace_days: number;
  recurring_percentage: number;
  recurring_interval_days: number;
  max_accumulated_percentage: number;
  is_active: boolean;
}

export interface SupplierImport {
  id: string;
  supplier_id: string;
  imported_by?: string;
  filename?: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_rows: number;
  processed_rows: number;
  created_at: string;
}

export interface ImportItem {
  id: string;
  import_id: string;
  product_code_original: string;
  product_name_original: string;
  price_original_detected: number;
  stock_detected: number;
  size_detected: string;
  color_detected: string;
  status: "pending" | "approved" | "rejected" | "modified_by_supplier" | "no_stock" | "deleted_in_origin" | "requires_review";
  comparison_data?: any;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action_type: string;
  entity_name: string;
  entity_id?: string;
  previous_values?: any;
  new_values?: any;
  reason?: string;
  ip_address?: string;
  created_at: string;
}

export interface Setting {
  key: string;
  value: any;
  description?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  priority: number;
  target_type: "general" | "supplier" | "category" | "product";
  target_id?: string | null;
  markup_percentage?: number | null;
  markup_fixed?: number | null;
  rounding_method: "sin_redondeo" | "a_100" | "a_500" | "a_1000" | "terminado_900" | "personalizado";
  rounding_value?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Initialize Supabase Connection ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;
export interface MockDatabaseSchema {
  profiles: Profile[];
  user_roles: UserRole[];
  customers: Customer[];
  suppliers: Supplier[];
  categories: Category[];
  products: Product[];
  product_variants: ProductVariant[];
  product_images: ProductImage[];
  purchase_rounds: PurchaseRound[];
  purchase_round_items: PurchaseRoundItem[];
  orders: Order[];
  order_items: OrderItem[];
  ledger_entries: LedgerEntry[];
  payments: Payment[];
  late_fee_rules: LateFeeRule[];
  supplier_imports: SupplierImport[];
  import_items: ImportItem[];
  audit_logs: AuditLog[];
  settings: Setting[];
  pricing_rules: PricingRule[];
  curated_looks: CuratedLook[];
  faqs: FAQ[];
  reviews: Review[];
  size_guides: SizeGuide[];
  club_members: ClubMember[];
  point_transactions: PointTransaction[];
  referrals: Referral[];
  coupons: Coupon[];
  club_config: ClubConfig;
  club_rewards: ClubReward[];
  client_photos: ClientPhoto[];
  fraud_alerts: FraudAlert[];
  club_notifications: ClubNotification[];
  work_shifts: WorkShift[];
}

const initialDb: MockDatabaseSchema = {
  profiles: [],
  user_roles: [],
  suppliers: [],
  categories: [],
  customers: [],
  products: [],
  product_variants: [],
  product_images: [],
  purchase_rounds: [],
  purchase_round_items: [],
  orders: [],
  order_items: [],
  ledger_entries: [],
  payments: [],
  late_fee_rules: [
    { id: "lf1", name: "Regla Estándar Mora", percentage_after_due: 5, fixed_amount_fee: 500, grace_days: 5, recurring_percentage: 2, recurring_interval_days: 30, max_accumulated_percentage: 20, is_active: true }
  ],
  supplier_imports: [],
  import_items: [],
  audit_logs: [
    { id: "al1", user_email: "system", action_type: "SYSTEM_INIT", entity_name: "settings", created_at: new Date().toISOString() }
  ],
  settings: [
    { key: "general_markup", value: { percentage: 55.00, fixed: 0.00 } },
    { key: "global_rounding", value: { method: "a_100" } },
    { key: "whatsapp_contact", value: { phone: "5491122334455", message_template: "Hola Pacheca! Vengo de la web y quiero consultar por {product_name} (Código: {product_code})" } }
  ],
  pricing_rules: [],
  curated_looks: [
    {
      id: "look1",
      name: "Look Basic Cozy",
      description: "Un conjunto cómodo y holgado ideal para las tardes de otoño. Combina nuestro buzo de algodón oversize con el mom jeans rígido clásico.",
      image_url: "/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp",
      product_ids: ["pr1", "pr11"],
      tags: ["casual", "otoño", "comodidad"]
    },
    {
      id: "look2",
      name: "Estilo Lencero Delicado",
      description: "La elegancia del satén y el lino en una combinación sutil. Perfecto para una salida casual o cena especial de verano.",
      image_url: "/images/img_3025-6de489edea28fd44c917477681715009-1024-1024.jpg",
      product_ids: ["pr3", "pr8"],
      tags: ["salida", "verano", "delicado"]
    },
    {
      id: "look3",
      name: "Otoño Urbano Confort",
      description: "Mantenete abrigada con nuestra selección de prendas tejidas que combinan estilo moderno y calidez.",
      image_url: "/images/dsc01952-84e7f3aec48512c8b417781783150678-1024-1024.webp",
      product_ids: ["pr5", "pr6", "pr7"],
      tags: ["abrigos", "casual", "invierno"]
    }
  ],
  faqs: [
    { id: "faq1", question: "¿Cómo elijo mi talle?", answer: "En la página de cada producto encontrarás un enlace a nuestra Guía de Talles con las medidas correspondientes. Si tenés dudas, podés contactarnos por WhatsApp.", category: "Talles", order: 1, is_published: true, created_at: new Date().toISOString() },
    { id: "faq2", question: "¿Cómo realizo un pedido?", answer: "Navegá por nuestro catálogo, seleccioná el talle y color deseados y agregalas a la bolsa de compras. Confirmás abonando el 50% de anticipo.", category: "Pedidos", order: 2, is_published: true, created_at: new Date().toISOString() },
    { id: "faq3", question: "¿Cuánto demora en llegar mi pedido?", answer: "El tiempo estimado de entrega para prendas a pedido es de 1 a 3 semanas según el modelo y disponibilidad.", category: "Envíos", order: 3, is_published: true, created_at: new Date().toISOString() },
    { id: "faq4", question: "¿Realizan envíos a todo el país?", answer: "Sí, enviamos a todas las provincias. El envío es gratuito en compras superiores a $95.000.", category: "Envíos", order: 4, is_published: true, created_at: new Date().toISOString() },
    { id: "faq5", question: "¿Cómo realizo un cambio?", answer: "Tenés hasta 30 días para realizar cambios. La prenda debe estar sin uso y con su etiqueta original.", category: "Cambios", order: 5, is_published: true, created_at: new Date().toISOString() },
    { id: "faq6", question: "¿Qué medios de pago aceptan?", answer: "Aceptamos transferencias bancarias, Mercado Pago y tarjetas de crédito con 3 cuotas sin interés.", category: "Pagos", order: 6, is_published: true, created_at: new Date().toISOString() },
  ],
  reviews: [
    { id: "r1", customer_name: "Belén L.", rating: 5, comment: "Amé el conjunto! La calidad de la tela es increíble, suave y sin arrugas. El talle M me quedó perfecto.", product_name: "Conjunto Basic Oversize", status: "approved", created_at: new Date().toISOString() },
    { id: "r2", customer_name: "Camila G.", rating: 5, comment: "Muy linda la blusa, el color es igual a la foto. Le saco una estrella solo porque tardó 2 semanas más de lo esperado.", product_name: "Blusa Cruzada Satin", status: "approved", created_at: new Date().toISOString() },
    { id: "r3", customer_name: "Martina D.", rating: 5, comment: "Excelente atención! Me ayudaron con el talle por WhatsApp y el sweater quedó perfecto. Lo recomiendo 100%.", product_name: "Conjunto Hoodie Soft", status: "pending", created_at: new Date().toISOString() },
    { id: "r4", customer_name: "Valentina R.", rating: 4, comment: "El producto es lindo pero el color en persona es un poco más oscuro que en la foto. Igual me quedo con él.", product_name: "Conjunto Comfort Zip", status: "pending", created_at: new Date().toISOString() },
    { id: "r5", customer_name: "Sofía T.", rating: 5, comment: "Ya es la cuarta vez que compro en Pacheca y siempre quedo súper conforme. Las prendas son de una calidad impecable!", status: "approved", created_at: new Date().toISOString() },
  ],
  size_guides: [
    { id: "sg1", size: "XS", bust_min: 78, bust_max: 84, waist_min: 58, waist_max: 64, hip_min: 84, hip_max: 90 },
    { id: "sg2", size: "S", bust_min: 85, bust_max: 91, waist_min: 65, waist_max: 71, hip_min: 91, hip_max: 97 },
    { id: "sg3", size: "M", bust_min: 92, bust_max: 98, waist_min: 72, waist_max: 78, hip_min: 98, hip_max: 104 },
    { id: "sg4", size: "L", bust_min: 99, bust_max: 105, waist_min: 79, waist_max: 85, hip_min: 105, hip_max: 111 },
    { id: "sg5", size: "XL", bust_min: 106, bust_max: 112, waist_min: 86, waist_max: 92, hip_min: 112, hip_max: 118 },
    { id: "sg6", size: "XXL", bust_min: 113, bust_max: 119, waist_min: 93, waist_max: 99, hip_min: 119, hip_max: 125 },
  ],
  club_members: [],
  point_transactions: [],
  referrals: [],
  coupons: [],
  club_config: {
    points_welcome: 100,
    money_to_points_ratio: 100,
    points_per_review: 150,
    points_per_photo: 300,
    points_per_referral: 500,
    points_birthday_multiplier: 2,
    points_expiry_days: 365,
    min_purchase_for_referral_benefit: 5000,
    referral_discount_friend: 5,
    referral_discount_referrer: 10,
    referral_coupon_expiry_days: 45,
    referrals_max_per_month: 10,
    is_referral_discount_accumulable: false,
  },
  club_rewards: [
    {
      id: "cr1",
      name: "5% de Descuento",
      description: "Obtené un 5% de descuento en tu próxima compra sin mínimo de compra.",
      points_required: 500,
      benefit_type: "percentage",
      benefit_value: 5,
      min_purchase_amount: 0,
      expires_days: 30,
      stock: 999,
      is_active: true
    },
    {
      id: "cr2",
      name: "10% de Descuento",
      description: "Obtené un 10% de descuento en tu próxima compra sin mínimo de compra.",
      points_required: 1000,
      benefit_type: "percentage",
      benefit_value: 10,
      min_purchase_amount: 0,
      expires_days: 30,
      stock: 999,
      is_active: true
    },
    {
      id: "cr3",
      name: "Envío Bonificado",
      description: "Envío gratis a todo el país para tu próxima compra.",
      points_required: 1500,
      benefit_type: "free_shipping",
      benefit_value: 0,
      min_purchase_amount: 0,
      expires_days: 30,
      stock: 999,
      is_active: true
    },
    {
      id: "cr4",
      name: "15% de Descuento",
      description: "Obtené un 15% de descuento en tu próxima compra.",
      points_required: 2000,
      benefit_type: "percentage",
      benefit_value: 15,
      min_purchase_amount: 0,
      expires_days: 30,
      stock: 999,
      is_active: true
    },
    {
      id: "cr5",
      name: "Regalo Sorpresa",
      description: "Un accesorio sorpresa de Pacheca de regalo con tu próximo pedido.",
      points_required: 3000,
      benefit_type: "free_gift",
      benefit_value: 0,
      min_purchase_amount: 0,
      expires_days: 45,
      stock: 100,
      is_active: true
    }
  ],
  client_photos: [],
  fraud_alerts: [],
  club_notifications: [],
  work_shifts: [
    {
      id: "ws1",
      employee_id: "p2",
      date: "2026-06-10",
      start_time: "09:00",
      end_time: "12:00",
      hours: 3,
      notes: "Apertura y orden del local",
      edit_count: 0,
      created_by: "virginia@somospacheca.com.ar",
      created_at: new Date().toISOString()
    },
    {
      id: "ws2",
      employee_id: "p12",
      date: "2026-06-10",
      start_time: "16:30",
      end_time: "20:00",
      hours: 3.5,
      notes: "Atención tarde y cierre",
      edit_count: 0,
      created_by: "virginia@somospacheca.com.ar",
      created_at: new Date().toISOString()
    }
  ]
};

// Stateful memory store attached to node global object to survive hot reloads
const globalForDb = global as unknown as { mockDb?: MockDatabaseSchema };
if (!globalForDb.mockDb) {
  globalForDb.mockDb = initialDb;
}

export const mockDb = globalForDb.mockDb!;

// --- Unified Database Services ---

export const db = {
  // Profiles
  profiles: {
    list: async () => {
      if (supabase) {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        return data as Profile[];
      }
      return mockDb.profiles;
    },
    get: async (id: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data as Profile | null;
      }
      return mockDb.profiles.find((p) => p.id === id) || null;
    },
    getByEmail: async (email: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("profiles").select("*").eq("email", email.toLowerCase()).maybeSingle();
        if (error) throw error;
        return data as Profile | null;
      }
      return mockDb.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
    },
    update: async (id: string, data: Partial<Profile>) => {
      if (supabase) {
        // Sanitize missing columns from the SQL schema
        const { whatsapp, password, ...sanitizedData } = data as any;
        const { data: updatedData, error } = await supabase.from("profiles").update(sanitizedData).eq("id", id).select().maybeSingle();
        if (error) throw error;
        return updatedData as Profile | null;
      }
      const idx = mockDb.profiles.findIndex((p) => p.id === id);
      if (idx !== -1) {
        mockDb.profiles[idx] = { ...mockDb.profiles[idx], ...data };
        return mockDb.profiles[idx];
      }
      return null;
    }
  },

  // User Roles
  userRoles: {
    getByUser: async (userId: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", userId).maybeSingle();
        if (error) throw error;
        return data as UserRole | null;
      }
      return mockDb.user_roles.find((ur) => ur.user_id === userId) || null;
    },
    setRole: async (userId: string, role: "administrator" | "employee" | "client") => {
      if (supabase) {
        const { data } = await supabase.from("user_roles").select("*").eq("user_id", userId).maybeSingle();
        if (data) {
          const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", userId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
          if (error) throw error;
        }
        return;
      }
      const idx = mockDb.user_roles.findIndex((ur) => ur.user_id === userId);
      if (idx !== -1) {
        mockDb.user_roles[idx].role = role;
      } else {
        mockDb.user_roles.push({ id: `ur_${Date.now()}`, user_id: userId, role });
      }
    }
  },

  // Customers
  customers: {
    list: async () => {
      if (supabase) {
        const { data, error } = await supabase.from("customers").select("*");
        if (error) throw error;
        return data as Customer[];
      }
      return mockDb.customers;
    },
    get: async (id: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data as Customer | null;
      }
      return mockDb.customers.find((c) => c.id === id) || null;
    },
    getByProfile: async (profileId: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("customers").select("*").eq("profile_id", profileId).maybeSingle();
        if (error) throw error;
        return data as Customer | null;
      }
      return mockDb.customers.find((c) => c.profile_id === profileId) || null;
    },
    getByDni: async (dni: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("customers").select("*").eq("dni", dni).maybeSingle();
        if (error) throw error;
        return data as Customer | null;
      }
      return mockDb.customers.find((c) => c.dni === dni) || null;
    },
    create: async (customer: Omit<Customer, "id" | "created_at" | "updated_at">) => {
      if (supabase) {
        const { data, error } = await supabase.from("customers").insert(customer).select().single();
        if (error) throw error;
        return data as Customer;
      }
      const newCust: Customer = {
        ...customer,
        id: `cust_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.customers.push(newCust);
      return newCust;
    },
    update: async (id: string, updates: Partial<Customer>) => {
      if (supabase) {
        const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select().maybeSingle();
        if (error) throw error;
        return data as Customer | null;
      }
      const idx = mockDb.customers.findIndex((c) => c.id === id);
      if (idx !== -1) {
        mockDb.customers[idx] = {
          ...mockDb.customers[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return mockDb.customers[idx];
      }
      return null;
    },
  },

  // Suppliers
  suppliers: {
    list: async () => {
      if (supabase) {
        const { data, error } = await supabase.from("suppliers").select("*");
        if (error) throw error;
        return data as Supplier[];
      }
      return mockDb.suppliers;
    },
    get: async (id: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data as Supplier | null;
      }
      return mockDb.suppliers.find((s) => s.id === id) || null;
    },
    create: async (supplier: Omit<Supplier, "id">) => {
      if (supabase) {
        const { data, error } = await supabase.from("suppliers").insert(supplier).select().single();
        if (error) throw error;
        return data as Supplier;
      }
      const newSup: Supplier = {
        ...supplier,
        id: `sup_${Date.now()}`,
      };
      mockDb.suppliers.push(newSup);
      return newSup;
    },
    update: async (id: string, updates: Partial<Supplier>) => {
      if (supabase) {
        const { data, error } = await supabase.from("suppliers").update(updates).eq("id", id).select().maybeSingle();
        if (error) throw error;
        return data as Supplier | null;
      }
      const idx = mockDb.suppliers.findIndex((s) => s.id === id);
      if (idx !== -1) {
        mockDb.suppliers[idx] = {
          ...mockDb.suppliers[idx],
          ...updates,
        };
        return mockDb.suppliers[idx];
      }
      return null;
    }
  },

  // Categories
  categories: {
    list: async () => {
      if (supabase) {
        const { data, error } = await supabase.from("categories").select("*");
        if (error) throw error;
        return data as Category[];
      }
      return mockDb.categories;
    },
    get: async (id: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data as Category | null;
      }
      return mockDb.categories.find((c) => c.id === id) || null;
    },
    create: async (category: Omit<Category, "id" | "created_at">) => {
      if (supabase) {
        const { data, error } = await supabase.from("categories").insert(category).select().single();
        if (error) throw error;
        return data as Category;
      }
      const newCat: Category = {
        ...category,
        id: `c_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockDb.categories.push(newCat);
      return newCat;
    },
    update: async (id: string, updates: Partial<Category>) => {
      if (supabase) {
        const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().maybeSingle();
        if (error) throw error;
        return data as Category | null;
      }
      const idx = mockDb.categories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        mockDb.categories[idx] = {
          ...mockDb.categories[idx],
          ...updates,
        };
        return mockDb.categories[idx];
      }
      return null;
    },
    delete: async (id: string) => {
      if (supabase) {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        return true;
      }
      const idx = mockDb.categories.findIndex((c) => c.id === id);
      if (idx !== -1) {
        mockDb.categories.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  // Products
  products: {
    list: async () => {
      if (supabase) {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        return data as Product[];
      }
      return mockDb.products;
    },
    get: async (id: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        return data as Product | null;
      }
      return mockDb.products.find((p) => p.id === id) || null;
    },
    getBySlug: async (slug: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("products").select("*").eq("slug_public", slug).maybeSingle();
        if (error) throw error;
        return data as Product | null;
      }
      return mockDb.products.find((p) => p.slug_public === slug) || null;
    },
    listByCategoryId: async (catId: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("products").select("*").eq("category_id", catId);
        if (error) throw error;
        return data as Product[];
      }
      return mockDb.products.filter((p) => p.category_id === catId);
    },
    create: async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
      if (supabase) {
        // Sanitize missing columns from the SQL schema
        const { created_by, updated_by, product_type, gender, size_guide_text, colors, images, round_id, ...sanitizedProduct } = product as any;
        const { data, error } = await supabase.from("products").insert(sanitizedProduct).select().single();
        if (error) throw error;
        return data as Product;
      }
      const newProd: Product = {
        ...product,
        id: `pr_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.products.push(newProd);
      return newProd;
    },
    update: async (id: string, updates: Partial<Product>) => {
      if (supabase) {
        // Sanitize missing columns from the SQL schema
        const { created_by, updated_by, product_type, gender, size_guide_text, colors, images, round_id, ...sanitizedUpdates } = updates as any;
        const { data, error } = await supabase.from("products").update(sanitizedUpdates).eq("id", id).select().maybeSingle();
        if (error) throw error;
        return data as Product | null;
      }
      const idx = mockDb.products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        mockDb.products[idx] = {
          ...mockDb.products[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return mockDb.products[idx];
      }
      return null;
    },
    getVariants: async (productId: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("product_variants").select("*").eq("product_id", productId);
        if (error) throw error;
        return data as ProductVariant[];
      }
      return mockDb.product_variants.filter((pv) => pv.product_id === productId);
    },
    getImages: async (productId: string) => {
      if (supabase) {
        const { data, error } = await supabase.from("product_images").select("*").eq("product_id", productId);
        if (error) throw error;
        return data as ProductImage[];
      }
      return mockDb.product_images.filter((pi) => pi.product_id === productId);
    },
  },

  // Orders
  orders: {
    list: async () => mockDb.orders,
    get: async (id: string) => mockDb.orders.find((o) => o.id === id) || null,
    listByCustomer: async (customerId: string) => mockDb.orders.filter((o) => o.customer_id === customerId),
    getItems: async (orderId: string) => mockDb.order_items.filter((oi) => oi.order_id === orderId),
    create: async (order: Omit<Order, "id" | "created_at" | "updated_at">, items: Omit<OrderItem, "id" | "order_id">[]) => {
      const orderId = `o_${Date.now()}`;
      const newOrder: Order = {
        ...order,
        id: orderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.orders.push(newOrder);

      const createdItems: OrderItem[] = [];
      items.forEach((item, index) => {
        const newItem: OrderItem = {
          ...item,
          id: `oi_${Date.now()}_${index}`,
          order_id: orderId,
        };
        mockDb.order_items.push(newItem);
        createdItems.push(newItem);

        // Also add logic to purchase rounds automatically
        const prod = mockDb.products.find((p) => p.id === item.product_id);
        if (prod) {
          const supplierId = prod.supplier_id;
          // Find open round for supplier
          let round = mockDb.purchase_rounds.find((r) => r.supplier_id === supplierId && r.status === "abierta");
          if (!round) {
            // Create a new open round for this supplier
            const supp = mockDb.suppliers.find((s) => s.id === supplierId);
            const roundId = `r_${Date.now()}`;
            round = {
              id: roundId,
              supplier_id: supplierId,
              code_round: `${supp?.name.toUpperCase() || "SUPP"}-ROUND-${Math.floor(Math.random() * 900 + 100)}`,
              minimum_type: supp?.minimum_type || "sin_minimo",
              minimum_amount: supp?.minimum_amount || 0,
              minimum_items: supp?.minimum_items || 0,
              accumulated_cost: 0,
              accumulated_items: 0,
              amount_needed: supp?.minimum_amount || 0,
              items_needed: supp?.minimum_items || 0,
              progress_percentage: 0,
              status: "abierta",
              opened_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            };
            mockDb.purchase_rounds.push(round);
          }

          // Link item to round
          mockDb.purchase_round_items.push({
            id: `ri_${Date.now()}_${index}`,
            round_id: round.id,
            order_item_id: newItem.id,
            status: "pending"
          });

          // Update round stats
          round.accumulated_cost += (newItem.price_unit_cost * newItem.quantity);
          round.accumulated_items += newItem.quantity;
          
          if (round.minimum_type === "monto_minimo") {
            round.amount_needed = Math.max(0, round.minimum_amount - round.accumulated_cost);
            round.progress_percentage = Math.min(100, (round.accumulated_cost / round.minimum_amount) * 100);
          } else if (round.minimum_type === "cantidad_prendas") {
            round.items_needed = Math.max(0, round.minimum_items - round.accumulated_items);
            round.progress_percentage = Math.min(100, (round.accumulated_items / round.minimum_items) * 100);
          } else if (round.minimum_type === "monto_y_cantidad") {
            const amtProgress = (round.accumulated_cost / round.minimum_amount) * 100;
            const itemProgress = (round.accumulated_items / round.minimum_items) * 100;
            round.progress_percentage = Math.min(100, Math.min(amtProgress, itemProgress));
            round.amount_needed = Math.max(0, round.minimum_amount - round.accumulated_cost);
            round.items_needed = Math.max(0, round.minimum_items - round.accumulated_items);
          }

          if (round.progress_percentage >= 100) {
            round.status = "minimo_alcanzado";
          }
        }
      });

      return { order: newOrder, items: createdItems };
    },
    updateStatus: async (id: string, internalStatus: Order["status_internal"], publicStatus: Order["status_public"]) => {
      const idx = mockDb.orders.findIndex((o) => o.id === id);
      if (idx !== -1) {
        const oldStatus = mockDb.orders[idx].status_public;
        mockDb.orders[idx].status_internal = internalStatus;
        mockDb.orders[idx].status_public = publicStatus;
        mockDb.orders[idx].updated_at = new Date().toISOString();
        
        // Trigger loyalty status sync hook
        await db.club.onOrderStatusChange(id, oldStatus, publicStatus);
        
        return mockDb.orders[idx];
      }
      return null;
    }
  },

  // Purchase Rounds
  purchaseRounds: {
    list: async () => mockDb.purchase_rounds,
    get: async (id: string) => mockDb.purchase_rounds.find((r) => r.id === id) || null,
    getItems: async (roundId: string) => {
      const connections = mockDb.purchase_round_items.filter((ri) => ri.round_id === roundId);
      return connections.map(conn => {
        const item = mockDb.order_items.find(oi => oi.id === conn.order_item_id);
        const order = mockDb.orders.find(o => o.id === item?.order_id);
        const customer = mockDb.customers.find(c => c.id === order?.customer_id);
        const product = mockDb.products.find(p => p.id === item?.product_id);
        return {
          ...conn,
          orderItem: item,
          order,
          customer,
          product
        };
      });
    },
    update: async (id: string, updates: Partial<PurchaseRound>) => {
      const idx = mockDb.purchase_rounds.findIndex((r) => r.id === id);
      if (idx !== -1) {
        mockDb.purchase_rounds[idx] = {
          ...mockDb.purchase_rounds[idx],
          ...updates,
        };
        return mockDb.purchase_rounds[idx];
      }
      return null;
    }
  },

  // Ledger Entries
  ledger: {
    listByCustomer: async (customerId: string) => mockDb.ledger_entries
      .filter((le) => le.customer_id === customerId)
      .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()),
    
    addEntry: async (entry: Omit<LedgerEntry, "id" | "entry_date" | "balance_before" | "balance_after" | "created_at" | "status"> & { status?: LedgerEntry["status"] }) => {
      const cust = mockDb.customers.find((c) => c.id === entry.customer_id);
      const balanceBefore = cust ? cust.balance : 0.00;
      const balanceAfter = balanceBefore + entry.amount;
      
      const newEntry: LedgerEntry = {
        status: "vigente",
        ...entry,
        id: `le_${Date.now()}`,
        entry_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      };

      mockDb.ledger_entries.push(newEntry);
      
      // Update customer balance cache
      if (cust) {
        cust.balance = balanceAfter;
        // Adjust client status based on balance and debt status
        if (balanceAfter > cust.credit_limit) {
          cust.status = "bloqueado";
        } else if (balanceAfter <= 0) {
          cust.status = "al_dia";
        }
        cust.updated_at = new Date().toISOString();
      }

      return newEntry;
    },

    cancelEntry: async (id: string, reason: string, userId: string) => {
      const orig = mockDb.ledger_entries.find((le) => le.id === id);
      if (!orig || orig.status === "anulado") return null;

      orig.status = "anulado";
      orig.reason_for_edit = reason;

      // Compensating entry
      const comp = await db.ledger.addEntry({
        customer_id: orig.customer_id,
        type: "anulacion",
        description: `Anulación de: ${orig.description}`,
        amount: -orig.amount,
        reference_id: orig.reference_id,
        created_by: userId,
        related_entry_id: orig.id,
      });

      return comp;
    }
  },

  // Payments
  payments: {
    list: async () => mockDb.payments,
    listByCustomer: async (customerId: string) => mockDb.payments.filter((p) => p.customer_id === customerId),
    create: async (payment: Omit<Payment, "id" | "created_at" | "status">) => {
      const newPay: Payment = {
        ...payment,
        id: `pay_${Date.now()}`,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      mockDb.payments.push(newPay);
      return newPay;
    },
    verify: async (id: string, approve: boolean, userId: string) => {
      const pay = mockDb.payments.find((p) => p.id === id);
      if (!pay || pay.status !== "pending") return null;

      pay.status = approve ? "approved" : "rejected";
      pay.verified_by = userId;
      pay.verified_at = new Date().toISOString();

      if (approve) {
        // Automatically deduct from customer current account
        await db.ledger.addEntry({
          customer_id: pay.customer_id,
          type: pay.order_id ? "anticipo" : "pago",
          description: `Acreditación de Pago #${pay.id.substring(0, 8)} (${pay.payment_method.toUpperCase()})`,
          amount: -pay.amount,
          reference_id: pay.id,
          created_by: userId,
        });
        
        // If it was linked to an order, adjust order balance
        if (pay.order_id) {
          const ord = mockDb.orders.find((o) => o.id === pay.order_id);
          if (ord) {
            const oldStatus = ord.status_public;
            ord.remaining_balance = Math.max(0, ord.remaining_balance - pay.amount);
            if (ord.remaining_balance === 0) {
              ord.status_internal = "pedido_al_proveedor";
              ord.status_public = "pedido_confirmado";
            }
            ord.updated_at = new Date().toISOString();
            
            // Trigger loyalty status sync hook
            if (ord.status_public !== oldStatus) {
              await db.club.onOrderStatusChange(ord.id, oldStatus, ord.status_public);
            }
          }
        }
      }

      return pay;
    }
  },

  // Imports
  imports: {
    list: async () => mockDb.supplier_imports,
    get: async (id: string) => mockDb.supplier_imports.find((i) => i.id === id) || null,
    getItems: async (importId: string) => mockDb.import_items.filter((ii) => ii.import_id === importId),
    create: async (supplierId: string, filename: string, totalRows: number) => {
      const newImp: SupplierImport = {
        id: `imp_${Date.now()}`,
        supplier_id: supplierId,
        filename,
        status: "pending",
        total_rows: totalRows,
        processed_rows: 0,
        created_at: new Date().toISOString(),
      };
      mockDb.supplier_imports.push(newImp);
      return newImp;
    },
    addItem: async (item: Omit<ImportItem, "id">) => {
      const newItem: ImportItem = {
        ...item,
        id: `ii_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      };
      mockDb.import_items.push(newItem);
      return newItem;
    },
    updateStatus: async (id: string, status: SupplierImport["status"], processed: number) => {
      const imp = mockDb.supplier_imports.find((i) => i.id === id);
      if (imp) {
        imp.status = status;
        imp.processed_rows = processed;
      }
    }
  },

  // Audit Logs
  audit: {
    list: async () => mockDb.audit_logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    log: async (log: Omit<AuditLog, "id" | "created_at">) => {
      const newLog: AuditLog = {
        ...log,
        id: `al_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockDb.audit_logs.push(newLog);
      return newLog;
    }
  },

  // Settings
  settings: {
    get: async (key: string) => mockDb.settings.find((s) => s.key === key)?.value || null,
    set: async (key: string, value: any) => {
      const idx = mockDb.settings.findIndex((s) => s.key === key);
      if (idx !== -1) {
        mockDb.settings[idx].value = value;
      } else {
        mockDb.settings.push({ key, value });
      }
      return value;
    }
  },

  // Pricing Rules
  pricingRules: {
    list: async () => mockDb.pricing_rules,
    get: async (id: string) => mockDb.pricing_rules.find((r) => r.id === id) || null,
    create: async (rule: Omit<PricingRule, "id" | "created_at" | "updated_at">) => {
      const newRule: PricingRule = {
        ...rule,
        id: `pr_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.pricing_rules.push(newRule);
      return newRule;
    },
    update: async (id: string, updates: Partial<PricingRule>) => {
      const idx = mockDb.pricing_rules.findIndex((r) => r.id === id);
      if (idx !== -1) {
        mockDb.pricing_rules[idx] = {
          ...mockDb.pricing_rules[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return mockDb.pricing_rules[idx];
      }
      return null;
    },
    delete: async (id: string) => {
      const idx = mockDb.pricing_rules.findIndex((r) => r.id === id);
      if (idx !== -1) {
        mockDb.pricing_rules.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  // Looks
  looks: {
    list: async () => mockDb.curated_looks || [],
    get: async (id: string) => (mockDb.curated_looks || []).find((l) => l.id === id) || null,
    create: async (look: Omit<CuratedLook, "id">) => {
      const newLook: CuratedLook = {
        ...look,
        id: `look_${Date.now()}`,
      };
      mockDb.curated_looks.push(newLook);
      return newLook;
    },
    update: async (id: string, updates: Partial<Omit<CuratedLook, "id">>) => {
      const idx = mockDb.curated_looks.findIndex((l) => l.id === id);
      if (idx !== -1) {
        mockDb.curated_looks[idx] = {
          ...mockDb.curated_looks[idx],
          ...updates,
        };
        return mockDb.curated_looks[idx];
      }
      return null;
    },
    delete: async (id: string) => {
      const idx = mockDb.curated_looks.findIndex((l) => l.id === id);
      if (idx !== -1) {
        mockDb.curated_looks.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  // FAQs
  faqs: {
    list: async () => mockDb.faqs || [],
    get: async (id: string) => (mockDb.faqs || []).find((f) => f.id === id) || null,
    create: async (faq: Omit<FAQ, "id" | "created_at">) => {
      const newFaq: FAQ = {
        ...faq,
        id: `faq_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockDb.faqs.push(newFaq);
      return newFaq;
    },
    update: async (id: string, updates: Partial<Omit<FAQ, "id" | "created_at">>) => {
      const idx = mockDb.faqs.findIndex((f) => f.id === id);
      if (idx !== -1) {
        mockDb.faqs[idx] = {
          ...mockDb.faqs[idx],
          ...updates,
        };
        return mockDb.faqs[idx];
      }
      return null;
    },
    delete: async (id: string) => {
      const idx = mockDb.faqs.findIndex((f) => f.id === id);
      if (idx !== -1) {
        mockDb.faqs.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  // Reviews
  reviews: {
    list: async () => mockDb.reviews || [],
    get: async (id: string) => (mockDb.reviews || []).find((r) => r.id === id) || null,
    create: async (review: Omit<Review, "id" | "created_at">) => {
      const newReview: Review = {
        ...review,
        id: `rev_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockDb.reviews.push(newReview);
      return newReview;
    },
    update: async (id: string, updates: Partial<Omit<Review, "id" | "created_at">>) => {
      const idx = mockDb.reviews.findIndex((r) => r.id === id);
      if (idx !== -1) {
        mockDb.reviews[idx] = {
          ...mockDb.reviews[idx],
          ...updates,
        };
        return mockDb.reviews[idx];
      }
      return null;
    },
    delete: async (id: string) => {
      const idx = mockDb.reviews.findIndex((r) => r.id === id);
      if (idx !== -1) {
        mockDb.reviews.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  // Size Guides
  sizeGuides: {
    list: async () => mockDb.size_guides || [],
    get: async (id: string) => (mockDb.size_guides || []).find((sg) => sg.id === id) || null,
    getBySize: async (size: string) => (mockDb.size_guides || []).find((sg) => sg.size.toLowerCase() === size.toLowerCase()) || null,
    create: async (guide: Omit<SizeGuide, "id">) => {
      const newGuide: SizeGuide = {
        ...guide,
        id: `sg_${Date.now()}`,
      };
      mockDb.size_guides.push(newGuide);
      return newGuide;
    },
    update: async (id: string, updates: Partial<Omit<SizeGuide, "id">>) => {
      const idx = mockDb.size_guides.findIndex((sg) => sg.id === id);
      if (idx !== -1) {
        mockDb.size_guides[idx] = {
          ...mockDb.size_guides[idx],
          ...updates,
        };
        return mockDb.size_guides[idx];
      }
      return null;
    },
    delete: async (id: string) => {
      const idx = mockDb.size_guides.findIndex((sg) => sg.id === id);
      if (idx !== -1) {
        mockDb.size_guides.splice(idx, 1);
        return true;
      }
      return false;
    }
  },
  club: {
    config: {
      get: async () => mockDb.club_config,
      update: async (updates: Partial<ClubConfig>) => {
        mockDb.club_config = { ...mockDb.club_config, ...updates };
        return mockDb.club_config;
      }
    },
    members: {
      list: async () => mockDb.club_members,
      get: async (id: string) => mockDb.club_members.find((m) => m.id === id) || null,
      getByProfile: async (profileId: string) => mockDb.club_members.find((m) => m.profile_id === profileId) || null,
      create: async (profileId: string, birthday?: string) => {
        const existing = mockDb.club_members.find((m) => m.profile_id === profileId);
        if (existing) return existing;

        const profile = mockDb.profiles.find((p) => p.id === profileId);
        if (!profile) throw new Error("Perfil no encontrado.");

        const cleanFirstName = profile.first_name.trim().toUpperCase().replace(/[^A-Z]/g, "");
        const refCode = `${cleanFirstName || "CLIENTA"}-PACHECA`;

        let finalCode = refCode;
        let counter = 1;
        while (mockDb.club_members.some((m) => m.referral_code === finalCode)) {
          finalCode = `${refCode}${counter}`;
          counter++;
        }

        const newMember: ClubMember = {
          id: `cm_${Date.now()}`,
          profile_id: profileId,
          points_balance: mockDb.club_config.points_welcome,
          points_pending: 0,
          referral_code: finalCode,
          level: "Pacheca",
          birthday,
          registered_at: new Date().toISOString(),
          is_blocked: false,
        };

        mockDb.club_members.push(newMember);

        mockDb.point_transactions.push({
          id: `pt_${Date.now()}_welcome`,
          member_id: newMember.id,
          amount: mockDb.club_config.points_welcome,
          action_type: "welcome",
          status: "acreditado",
          description: "Puntos de bienvenida al Club Pacheca",
          created_at: new Date().toISOString()
        });

        mockDb.club_notifications.push({
          id: `not_${Date.now()}_w`,
          member_id: newMember.id,
          title: "¡Te uniste al Club Pacheca! 🎉",
          message: `¡Sumaste ${mockDb.club_config.points_welcome} Puntos Pacheca por registrarte! Ya podés ver tu código de referido para invitar amigas.`,
          created_at: new Date().toISOString(),
          is_read: false
        });

        if (typeof window !== "undefined") {
          const storedReferrerCode = localStorage.getItem("pacheca_referred_by");
          if (storedReferrerCode) {
            const referrer = mockDb.club_members.find(m => m.referral_code.toUpperCase() === storedReferrerCode.toUpperCase());
            if (referrer && referrer.profile_id !== profileId) {
              const referralId = `ref_${Date.now()}`;
              const newReferral: Referral = {
                id: referralId,
                referrer_member_id: referrer.id,
                friend_email: profile.email,
                friend_name: `${profile.first_name} ${profile.last_name}`,
                referral_code: storedReferrerCode,
                status: "registrado",
                created_at: new Date().toISOString(),
                friend_profile_id: profileId
              };
              mockDb.referrals.push(newReferral);

              const refCust = mockDb.customers.find(c => c.profile_id === referrer.profile_id);
              const friendCust = mockDb.customers.find(c => c.profile_id === profileId);
              
              if (refCust && friendCust) {
                const sameEmail = refCust.email?.toLowerCase() === friendCust.email?.toLowerCase();
                const samePhone = refCust.phone === friendCust.phone || refCust.whatsapp === friendCust.whatsapp;
                const sameDni = refCust.dni && friendCust.dni && refCust.dni === friendCust.dni;
                const sameAddress = refCust.address && friendCust.address && refCust.address.toLowerCase() === friendCust.address.toLowerCase();

                if (sameEmail || samePhone || sameDni) {
                  mockDb.fraud_alerts.push({
                    id: `fraud_${Date.now()}`,
                    type: "coincidencia_datos",
                    description: `Referido sospechoso entre ${refCust.first_name} y ${friendCust.first_name}. Datos coincidentes.`,
                    member_id: referrer.id,
                    referral_id: referralId,
                    status: "requiere_revision",
                    created_at: new Date().toISOString()
                  });
                  newReferral.status = "invitado";
                } else if (sameAddress) {
                  mockDb.fraud_alerts.push({
                    id: `fraud_${Date.now()}`,
                    type: "reincidencia_direccion",
                    description: `Referido comparte dirección: ${refCust.address}. Marcado para revisión.`,
                    member_id: referrer.id,
                    referral_id: referralId,
                    status: "requiere_revision",
                    created_at: new Date().toISOString()
                  });
                }
              }

              const friendCouponCode = `REF-${cleanFirstName}-${Math.floor(1000 + Math.random() * 9000)}`;
              mockDb.coupons.push({
                id: `cp_${Date.now()}_ref`,
                code: friendCouponCode,
                member_id: newMember.id,
                discount_type: "percentage",
                discount_value: mockDb.club_config.referral_discount_friend,
                min_purchase_amount: mockDb.club_config.min_purchase_for_referral_benefit,
                expires_at: new Date(Date.now() + mockDb.club_config.referral_coupon_expiry_days * 24 * 3600 * 1000).toISOString(),
                is_used: false,
                created_at: new Date().toISOString(),
                description: `Cupón de Referido (Amiga) - 5% de descuento`
              });

              mockDb.club_notifications.push({
                id: `not_${Date.now()}_ref`,
                member_id: newMember.id,
                title: "¡Cupón de Referido Listo! 🎁",
                message: `Por registrarte con el código de tu amiga, recibís un 5% de descuento en tu primera compra con el código: ${friendCouponCode}.`,
                created_at: new Date().toISOString(),
                is_read: false
              });

              mockDb.club_notifications.push({
                id: `not_${Date.now()}_ref_r`,
                member_id: referrer.id,
                title: "¡Tu amiga se registró! 💕",
                message: `Tu amiga ${profile.first_name} se ha unido al club. Cuando complete su primera compra, recibirás tu descuento del 10%.`,
                created_at: new Date().toISOString(),
                is_read: false
              });

              localStorage.removeItem("pacheca_referred_by");
            }
          }
        }

        return newMember;
      },
      update: async (id: string, updates: Partial<ClubMember>) => {
        const idx = mockDb.club_members.findIndex((m) => m.id === id);
        if (idx !== -1) {
          mockDb.club_members[idx] = {
            ...mockDb.club_members[idx],
            ...updates
          };
          return mockDb.club_members[idx];
        }
        return null;
      },
      addPointsManual: async (id: string, amount: number, adminId: string, reason: string) => {
        const member = mockDb.club_members.find((m) => m.id === id);
        if (!member) return null;

        member.points_balance = Math.max(0, member.points_balance + amount);

        mockDb.point_transactions.push({
          id: `pt_${Date.now()}_man`,
          member_id: member.id,
          amount,
          action_type: "manual_adjust",
          status: "acreditado",
          description: `Ajuste manual: ${reason}`,
          created_at: new Date().toISOString(),
          admin_id: adminId,
          reason
        });

        mockDb.audit_logs.push({
          id: `audit_${Date.now()}`,
          user_email: adminId,
          action_type: "MANUAL_POINTS_ADJUST",
          entity_name: "club_members",
          entity_id: member.id,
          reason: `Ajuste de puntos: ${amount > 0 ? "+" : ""}${amount}. Motivo: ${reason}`,
          created_at: new Date().toISOString()
        });

        mockDb.club_notifications.push({
          id: `not_${Date.now()}_man`,
          member_id: member.id,
          title: amount > 0 ? "Ajuste de puntos (+) 💎" : "Ajuste de puntos (-) ⚠️",
          message: `Administración ajustó tus puntos en tu cuenta: ${amount > 0 ? "+" : ""}${amount} Puntos. Motivo: ${reason}`,
          created_at: new Date().toISOString(),
          is_read: false
        });

        return member;
      }
    },
    transactions: {
      list: async () => mockDb.point_transactions,
      listByMember: async (memberId: string) => mockDb.point_transactions.filter((t) => t.member_id === memberId)
    },
    referrals: {
      list: async () => mockDb.referrals,
      listByReferrer: async (memberId: string) => mockDb.referrals.filter((r) => r.referrer_member_id === memberId),
      getByCode: async (code: string) => mockDb.referrals.find((r) => r.referral_code === code)
    },
    rewards: {
      list: async () => mockDb.club_rewards,
      get: async (id: string) => mockDb.club_rewards.find((r) => r.id === id) || null,
      create: async (reward: Omit<ClubReward, "id">) => {
        const newReward: ClubReward = {
          ...reward,
          id: `cr_${Date.now()}`
        };
        mockDb.club_rewards.push(newReward);
        return newReward;
      },
      update: async (id: string, updates: Partial<ClubReward>) => {
        const idx = mockDb.club_rewards.findIndex((r) => r.id === id);
        if (idx !== -1) {
          mockDb.club_rewards[idx] = {
            ...mockDb.club_rewards[idx],
            ...updates
          };
          return mockDb.club_rewards[idx];
        }
        return null;
      },
      delete: async (id: string) => {
        const idx = mockDb.club_rewards.findIndex((r) => r.id === id);
        if (idx !== -1) {
          mockDb.club_rewards.splice(idx, 1);
          return true;
        }
        return false;
      },
      redeem: async (memberId: string, rewardId: string) => {
        const member = mockDb.club_members.find((m) => m.id === memberId);
        const reward = mockDb.club_rewards.find((r) => r.id === rewardId);
        if (!member || !reward || !reward.is_active || reward.stock <= 0) return null;

        if (member.points_balance < reward.points_required) {
          throw new Error("Puntos insuficientes.");
        }

        member.points_balance -= reward.points_required;
        reward.stock -= 1;

        const couponCode = `CANJE-${reward.benefit_type.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const expiryDate = new Date(Date.now() + reward.expires_days * 24 * 3600 * 1000).toISOString();
        
        const newCoupon: Coupon = {
          id: `cp_${Date.now()}_cnj`,
          code: couponCode,
          member_id: member.id,
          discount_type: reward.benefit_type,
          discount_value: reward.benefit_value,
          min_purchase_amount: reward.min_purchase_amount,
          expires_at: expiryDate,
          is_used: false,
          created_at: new Date().toISOString(),
          description: `Cupón Canjeado - ${reward.name}`
        };
        mockDb.coupons.push(newCoupon);

        mockDb.point_transactions.push({
          id: `pt_${Date.now()}_red`,
          member_id: member.id,
          amount: -reward.points_required,
          action_type: "redemption",
          status: "acreditado",
          description: `Canje de beneficio: ${reward.name}`,
          created_at: new Date().toISOString()
        });

        mockDb.club_notifications.push({
          id: `not_${Date.now()}_red`,
          member_id: member.id,
          title: "¡Canje exitoso! 🎁",
          message: `Canjeaste ${reward.points_required} puntos por: ${reward.name}. Usá tu código en el carrito: ${couponCode}`,
          created_at: new Date().toISOString(),
          is_read: false
        });

        return { member, coupon: newCoupon };
      }
    },
    coupons: {
      list: async () => mockDb.coupons,
      getByCode: async (code: string) => mockDb.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase()) || null,
      listByMember: async (memberId: string) => 
        mockDb.coupons.filter((c) => c.member_id === memberId && !c.is_used && new Date(c.expires_at) > new Date()),
      create: async (coupon: Omit<Coupon, "id" | "is_used" | "created_at">) => {
        const newCoupon: Coupon = {
          ...coupon,
          id: `cp_${Date.now()}`,
          is_used: false,
          created_at: new Date().toISOString()
        };
        mockDb.coupons.push(newCoupon);
        return newCoupon;
      }
    },
    photos: {
      list: async () => mockDb.client_photos,
      listApproved: async () => mockDb.client_photos.filter(p => p.status === "approved"),
      submit: async (photo: Omit<ClientPhoto, "id" | "status" | "created_at" | "points_awarded">) => {
        const newPhoto: ClientPhoto = {
          ...photo,
          id: `photo_${Date.now()}`,
          status: "pending",
          created_at: new Date().toISOString(),
          points_awarded: false
        };
        mockDb.client_photos.push(newPhoto);
        return newPhoto;
      },
      approve: async (id: string, adminId: string) => {
        const photo = mockDb.client_photos.find((p) => p.id === id);
        if (!photo || photo.status !== "pending") return null;

        photo.status = "approved";
        
        const member = mockDb.club_members.find((m) => m.id === photo.member_id);
        if (member && !photo.points_awarded) {
          const pts = mockDb.club_config.points_per_photo;
          member.points_balance += pts;
          photo.points_awarded = true;

          mockDb.point_transactions.push({
            id: `pt_${Date.now()}_photo`,
            member_id: member.id,
            amount: pts,
            action_type: "photo",
            status: "acreditado",
            description: `Foto aprobada usando prenda de Pacheca`,
            created_at: new Date().toISOString()
          });

          mockDb.club_notifications.push({
            id: `not_${Date.now()}_photo_ok`,
            member_id: member.id,
            title: "¡Tu foto fue aprobada! 📸",
            message: `Aprobamos tu foto vistiendo nuestra prenda. ¡Sumaste ${pts} Puntos Pacheca a tu cuenta!`,
            created_at: new Date().toISOString(),
            is_read: false
          });
        }

        mockDb.audit_logs.push({
          id: `audit_${Date.now()}`,
          user_email: adminId,
          action_type: "PHOTO_APPROVE",
          entity_name: "client_photos",
          entity_id: photo.id,
          reason: "Foto aprobada y puntos acreditados",
          created_at: new Date().toISOString()
        });

        return photo;
      },
      reject: async (id: string) => {
        const photo = mockDb.client_photos.find((p) => p.id === id);
        if (!photo || photo.status !== "pending") return null;

        photo.status = "rejected";
        return photo;
      }
    },
    reviews: {
      submit: async (review: Omit<Review, "id" | "status" | "created_at">) => {
        const newReview: Review = {
          ...review,
          id: `rev_${Date.now()}`,
          status: "pending",
          created_at: new Date().toISOString()
        };
        mockDb.reviews.push(newReview);
        return newReview;
      },
      approve: async (id: string, adminId: string) => {
        const rev = mockDb.reviews.find((r) => r.id === id);
        if (!rev || rev.status !== "pending") return null;

        rev.status = "approved";

        if (rev.member_id && !rev.points_awarded) {
          const alreadyRewarded = mockDb.reviews.some((r) => r.member_id === rev.member_id && r.product_id === rev.product_id && r.id !== rev.id && r.points_awarded);
          
          if (!alreadyRewarded) {
            const member = mockDb.club_members.find((m) => m.id === rev.member_id);
            if (member) {
              const pts = mockDb.club_config.points_per_review;
              member.points_balance += pts;
              rev.points_awarded = true;

              mockDb.point_transactions.push({
                id: `pt_${Date.now()}_rev`,
                member_id: member.id,
                amount: pts,
                action_type: "review",
                status: "acreditado",
                description: `Reseña aprobada: ${rev.product_name || "Producto"}`,
                created_at: new Date().toISOString()
              });

              mockDb.club_notifications.push({
                id: `not_${Date.now()}_rev_ok`,
                member_id: member.id,
                title: "¡Reseña aprobada! 🌟",
                message: `Aprobamos tu opinión sobre ${rev.product_name}. ¡Sumaste ${pts} Puntos Pacheca!`,
                created_at: new Date().toISOString(),
                is_read: false
              });
            }
          }
        }

        mockDb.audit_logs.push({
          id: `audit_${Date.now()}`,
          user_email: adminId,
          action_type: "REVIEW_APPROVE",
          entity_name: "reviews",
          entity_id: rev.id,
          reason: "Reseña aprobada y puntos acreditados",
          created_at: new Date().toISOString()
        });

        return rev;
      },
      reject: async (id: string) => {
        const rev = mockDb.reviews.find((r) => r.id === id);
        if (!rev || rev.status !== "pending") return null;

        rev.status = "rejected";
        return rev;
      }
    },
    notifications: {
      list: async () => mockDb.club_notifications,
      listByMember: async (memberId: string) => mockDb.club_notifications.filter((n) => n.member_id === memberId),
      markRead: async (id: string) => {
        const not = mockDb.club_notifications.find(n => n.id === id);
        if (not) not.is_read = true;
        return not;
      }
    },
    onOrderStatusChange: async (orderId: string, oldStatus: string, newStatus: string) => {
      const order = mockDb.orders.find(o => o.id === orderId);
      if (!order) return;

      const customer = mockDb.customers.find(c => c.id === order.customer_id);
      if (!customer || !customer.profile_id) return;

      const member = mockDb.club_members.find(m => m.profile_id === customer.profile_id);
      const orderTxns = mockDb.point_transactions.filter(t => t.order_id === orderId);

      const isConfirmedOrDelivered = newStatus === "pedido_confirmado" || newStatus === "entregado" || newStatus === "en_preparacion" || newStatus === "en_camino" || newStatus === "recibido_en_pacheca" || newStatus === "listo_para_retirar" || newStatus === "enviado";
      const isCancelled = newStatus === "cancelado";

      if (member) {
        const pendingTx = orderTxns.find(t => t.status === "pendiente");
        
        if (isConfirmedOrDelivered && pendingTx) {
          pendingTx.status = "acreditado";
          member.points_balance += pendingTx.amount;

          mockDb.club_notifications.push({
            id: `not_${Date.now()}_ord_c`,
            member_id: member.id,
            title: "¡Puntos Acreditados! 🛍️",
            message: `¡Sumaste ${pendingTx.amount} Puntos Pacheca por tu compra en el pedido ${order.code_public}!`,
            created_at: new Date().toISOString(),
            is_read: false
          });
          
          const customerOrders = mockDb.orders.filter(o => o.customer_id === customer.id && o.status_public !== "cancelado");
          const totalSpent = customerOrders.reduce((sum, o) => sum + o.total_amount, 0);
          
          let newLevel: "Pacheca" | "Pacheca Plus" | "Pacheca VIP" = "Pacheca";
          if (totalSpent >= 300000) {
            newLevel = "Pacheca VIP";
          } else if (totalSpent >= 150000) {
            newLevel = "Pacheca Plus";
          }

          if (newLevel !== member.level) {
            member.level = newLevel;
            mockDb.club_notifications.push({
              id: `not_${Date.now()}_lvl`,
              member_id: member.id,
              title: `¡Subiste de Nivel: ${newLevel}! 🏆`,
              message: `Felicidades! Por tus compras acumuladas alcanzaste el nivel ${newLevel}. Disfrutá de tus nuevos beneficios exclusivos.`,
              created_at: new Date().toISOString(),
              is_read: false
            });
          }
        } else if (isCancelled) {
          orderTxns.forEach(tx => {
            if (tx.status === "acreditado") {
              tx.status = "revertido";
              member.points_balance = Math.max(0, member.points_balance - tx.amount);
            } else if (tx.status === "pendiente") {
              tx.status = "cancelado";
            }
          });

          const usedCoupon = mockDb.coupons.find(c => c.used_order_id === orderId);
          if (usedCoupon) {
            usedCoupon.is_used = false;
            usedCoupon.description += " (Compra cancelada)";
          }
        }
      }

      const referral = mockDb.referrals.find(r => r.friend_profile_id === customer.profile_id);
      if (referral) {
        if (isConfirmedOrDelivered && (referral.status === "registrado" || referral.status === "compra_pendiente")) {
          referral.status = "beneficio_acreditado";
          referral.order_id = orderId;

          const referrerMember = mockDb.club_members.find(m => m.id === referral.referrer_member_id);
          if (referrerMember) {
            const referrerProfile = mockDb.profiles.find(p => p.id === referrerMember.profile_id);
            const refCouponCode = `INV-${referrerProfile?.first_name.toUpperCase().substring(0,3)}-${Math.floor(1000 + Math.random() * 9000)}`;
            
            const pts = mockDb.club_config.points_per_referral;
            referrerMember.points_balance += pts;
            
            mockDb.point_transactions.push({
              id: `pt_${Date.now()}_ref_pt`,
              member_id: referrerMember.id,
              amount: pts,
              action_type: "referral_referrer",
              status: "acreditado",
              description: `Amiga recomendada completó su primera compra: ${customer.first_name}`,
              created_at: new Date().toISOString()
            });

            mockDb.coupons.push({
              id: `cp_${Date.now()}_ref_c`,
              code: refCouponCode,
              member_id: referrerMember.id,
              discount_type: "percentage",
              discount_value: mockDb.club_config.referral_discount_referrer,
              min_purchase_amount: 0,
              expires_at: new Date(Date.now() + mockDb.club_config.referral_coupon_expiry_days * 24 * 3600 * 1000).toISOString(),
              is_used: false,
              created_at: new Date().toISOString(),
              description: `Cupón de Invitación de Amiga (${customer.first_name}) - 10% de descuento`
            });

            mockDb.club_notifications.push({
              id: `not_${Date.now()}_ref_done`,
              member_id: referrerMember.id,
              title: "¡Beneficio de Referido Acreditado! 🎁",
              message: `¡Tu amiga ${customer.first_name} realizó su primera compra! Sumaste ${pts} puntos y tenés disponible tu cupón de 10% de descuento: ${refCouponCode}`,
              created_at: new Date().toISOString(),
              is_read: false
            });
          }
        } else if (isCancelled && referral.status === "beneficio_acreditado") {
          referral.status = "compra_cancelada";
          
          const referrerMember = mockDb.club_members.find(m => m.id === referral.referrer_member_id);
          if (referrerMember) {
            const pts = mockDb.club_config.points_per_referral;
            referrerMember.points_balance = Math.max(0, referrerMember.points_balance - pts);
            
            mockDb.point_transactions.push({
              id: `pt_${Date.now()}_ref_rev`,
              member_id: referrerMember.id,
              amount: -pts,
              action_type: "cancel_order",
              status: "acreditado",
              description: `Reversión de puntos por compra cancelada de referida`,
              created_at: new Date().toISOString()
            });

            const friendNamePrefix = customer.first_name;
            const refCoupon = mockDb.coupons.find(c => c.member_id === referrerMember.id && c.description.includes(friendNamePrefix) && !c.is_used);
            if (refCoupon) {
              refCoupon.is_used = true;
              refCoupon.description += " (Anulado por compra de amiga cancelada)";
            }

            mockDb.club_notifications.push({
              id: `not_${Date.now()}_ref_rev_n`,
              member_id: referrerMember.id,
              title: "Referido revertido ⚠️",
              message: `La compra de tu amiga ${customer.first_name} fue cancelada. Se debitaron los puntos y anuló el cupón relacionado.`,
              created_at: new Date().toISOString(),
              is_read: false
            });
          }
        }
      }
    },
  },
  workShifts: {
    list: async () => mockDb.work_shifts || [],
    create: async (shift: Omit<WorkShift, "id" | "created_at">) => {
      const newShift: WorkShift = {
        ...shift,
        id: `ws_${Date.now()}`,
        created_at: new Date().toISOString()
      };
      if (!mockDb.work_shifts) mockDb.work_shifts = [];
      mockDb.work_shifts.push(newShift);
      return newShift;
    },
    update: async (id: string, updates: Partial<Omit<WorkShift, "id" | "created_at">>) => {
      if (!mockDb.work_shifts) mockDb.work_shifts = [];
      const idx = mockDb.work_shifts.findIndex(ws => ws.id === id);
      if (idx !== -1) {
        mockDb.work_shifts[idx] = {
          ...mockDb.work_shifts[idx],
          ...updates
        };
        return mockDb.work_shifts[idx];
      }
      return null;
    },
    delete: async (id: string) => {
      if (!mockDb.work_shifts) mockDb.work_shifts = [];
      const idx = mockDb.work_shifts.findIndex(ws => ws.id === id);
      if (idx !== -1) {
        mockDb.work_shifts.splice(idx, 1);
        return true;
      }
      return false;
    }
  }
};
