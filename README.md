# StoreMS: Enterprise Store Management System
**MSBTE Computer Engineering Second Year (K-Scheme) Micro-Project**

---

## Abstract
StoreMS is a cloud-based, multi-tier web application designed to manage retail inventory, warehouse supply chains, and point-of-sale (POS) operations. Built with a modular architecture, the system enforces strict Role-Based Access Control (RBAC) and communicates asynchronously with a relational PostgreSQL database instance.

---

## Live System & Audit Interfaces
* **Production Application:** [Vercel Deployment Pipeline](https://dbms-project-store-management-system.vercel.app) *(Replace with your live link if customized)*
* **Direct Database Audit Inspector:** [Live Database Viewer (GitHub Pages)](https://rohit4738.github.io/dbviwer/)

---

## Technical Architecture & Tech Stack
* **Database & Backend:** Supabase (PostgreSQL), utilizing relational schemas, foreign key constraints, and dynamic table views.
* **Frontend Layer:** Vanilla JavaScript (ES6+), HTML5, and Tailwind CSS utilizing an industrial design system.
* **Deployment & Version Control:** Vercel (CI/CD Hosting Pipeline) and GitHub (Source Code Management).
* **State Management:** Browser `localStorage` integration for persistent session handling across page reloads.

---

## Role-Based Access Control (RBAC) Specifications
1. **Owner (`owner` / `owner123`)**: 
   * Access level: Full system audit and analytics.
   * Capabilities: View comprehensive inventory states, monitor store vs. warehouse stock discrepancies, and review/approve incoming administrative requests.
2. **Provider (`provider` / `provider123`)**: 
   * Access level: Supply chain and logistics management.
   * Capabilities: Dispatch bulk inventory restocks to retail nodes and propose new product listings into the system pipeline.
3. **Manager (`manager` / `manager123`)**: 
   * Access level: Point of Sale (POS) and retail operations.
   * Capabilities: Execute multi-item cart checkouts, automatically update relational stock quantities, generate formatted transaction receipts, and modify item pricing dynamically.

---

## Relational Database Schema Overview
* **`users`**: Manages entity authentication credentials, role definitions, and access permissions.
* **`products`**: Maintains inventory metrics, tracking distinct attributes including `store_stock`, `provider_stock`, pricing, and category mapping.
* **`sales`**: Foreign key-linked audit ledger capturing transactional volumes, quantities sold, and automated timestamps.
* **`requests`**: Administrative workflow queue handling asynchronous communication channels between system tiers.

---

## System Diagnostics & Safety Features
* **Automated Health Checks**: Built-in runtime connection verification verifying database availability and handling node dropouts via an exception overlay.
* **Database Inspector**: Dedicated raw audit ledger (`db-viewer.html`) configured for direct schema validation during technical evaluations.
