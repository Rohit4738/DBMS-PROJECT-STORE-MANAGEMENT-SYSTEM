# 🛒 Store Management System (StoreMS)
**MSBTE Computer Engineering Second Year Micro-Project**

##  stuff used:
* **Database:** Supabase (Cloud PostgreSQL)
* **Frontend:** HTML5, Tailwind CSS, JavaScript (ES6)
* **Deployment & Version Control:** Vercel & GitHub

##  Role-Based Access Control (RBAC)
1. **Owner (`owner` / `owner123`):** High-level auditing across local store inventory and provider warehouse stock.
2. **Provider (`provider` / `provider123`):** Logistics controller to dispatch restock shipments to the store.
3. **Manager (`manager` / `manager123`):** Handles dynamic price updates and Point-of-Sale (POS) customer checkouts.

##  Database Schema Relationships
* **`users`**: Handles credential validation and role assignment.
* **`products`**: Maintains inventory mapping (`store_stock` and `provider_stock`).
* **`sales`**: Foreign key relational link tracking checkout logs and timestamped revenue.
