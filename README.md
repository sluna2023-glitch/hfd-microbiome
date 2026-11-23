# HFD Microbiome Analyzer

Aplicación científica para analizar y comparar la microbiota intestinal entre ratones con dieta normal (**Control**) y dieta alta en grasas (**HFD**), con filtros filogenéticos interactivos, análisis metabólico e inflamatorio, exportación a **Excel / PDF** y consulta directa en **NCBI PubMed** y **BugSigDB**.

Incluye los datos experimentales publicados de **Shen Y et al. (2025)** (`PMID: 40783398`, `DOI: 10.1038/s41522-025-00799-3`) y permite cargar tus propios archivos **CSV, TSV o Excel**.

---

## Cómo ejecutar el programa en tu computador (sin usar AI Studio)

No necesitas cuentas ni claves de API para ejecutar el programa en tu computador: el análisis estadístico, los gráficos, la exportación a Excel/PDF y las consultas a PubMed y BugSigDB funcionan directamente desde tu equipo.

### Paso 1: Descargar el proyecto a tu computador
1. En la barra superior de AI Studio, haz clic en el ícono de **Descargar proyecto (Download / Export as ZIP)** y guarda el archivo en tu computador.
2. Descomprime la carpeta `.zip` en la ubicación que prefieras (por ejemplo, en `Documentos\HFD-Microbiome-Analyzer`).

### Paso 2: Instalar Node.js (solo una vez)
1. Descarga e instala la versión **LTS** de **Node.js** desde [https://nodejs.org/](https://nodejs.org/).
2. Acepta las opciones predeterminadas del instalador.

### Paso 3: Iniciar el programa

#### En Windows (forma rápida con doble clic)
1. Abre la carpeta descomprimida.
2. Haz doble clic en **`Iniciar_Windows.bat`**.
3. La primera vez instalará automáticamente las dependencias (`node_modules`) y luego abrirá tu navegador en **`http://localhost:3000`**.

#### En macOS o Linux
1. Abre la carpeta en Terminal y da permisos una sola vez:
   ```bash
   chmod +x Iniciar_Mac_Linux.command
   ```
2. Ejecútalo con `./Iniciar_Mac_Linux.command` (o doble clic en macOS).

#### Alternativa manual desde Terminal / PowerShell (cualquier sistema)
Dentro de la carpeta del proyecto, ejecuta:
```bash
npm install
npm run dev
```
Luego abre en tu navegador: **`http://localhost:3000`**

> **Nota sobre conexión a internet:** La carga de tus archivos, cálculos estadísticos, filtros, gráficos y descargas en Excel/PDF funcionan **100 % sin internet**. Solo las búsquedas en tiempo real en **NCBI PubMed** y **BugSigDB** requieren conexión a internet.
