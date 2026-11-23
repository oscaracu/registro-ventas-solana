# Registro de Ventas Solana

Monorepo con un programa Anchor y una aplicación React para registrar múltiples ventas por cliente sin depender del SKU como identidad.

## Contenido

- `programa/`: programa Rust/Anchor. Cada venta usa una semilla PDA basada en `id_venta` en little-endian.
- `app/`: frontend React, cliente Codama e integración con Solana Devnet.
- `app/.devcontainer/`: entorno reproducible con Node.js 22, Rust, Solana CLI y Anchor CLI.

## Desarrollo

Abrir la carpeta raíz con VS Code Dev Containers y ejecutar las verificaciones:

```bash
cd app
npm install
npm run verificar
```

El Program ID local se configura en `programa/declare_id!()` y `programa/Anchor.toml`, y debe coincidir con `app/idl.json` y `app/src/config/programa.json`.

Las keypairs locales de despliegue se excluyen de Git y deben mantenerse fuera del repositorio.

## Ruta de acreditación

Este repositorio corresponde a la ruta de **proyecto guiado con mejora funcional**.

**Versión base:** [WayLearnLatam/Registro-Ventas-Solana-PDA](https://github.com/WayLearnLatam/Registro-Ventas-Solana-PDA) y [WayLearnLatam/Registro-Ventas-Solana-App](https://github.com/WayLearnLatam/Registro-Ventas-Solana-App).

**Aporte propio:** sustituir la PDA de `Venta` basada en SKU por una PDA incremental basada en `id_venta`. El identificador se guarda en `Cliente.id_venta_counter` y se convierte a dos bytes little-endian para derivar:

```text
[b"venta", cliente.key().as_ref(), id_venta.to_le_bytes().as_ref()]
```

Esto permite registrar varias veces el mismo SKU para un mismo cliente sin colisiones.

## Configuración

- **Program ID generado:** `AzKi4QgysdSYuhahL2P114mRWHRDPNWJtDfhYe39ByRD`
- **Wallet pública de pruebas:** `CgRv5Sj8bgc3Lw3MZ7gDVEdTXfQ9orwpXuUR146tQ8xQ`
- **Red:** Solana Devnet
- **RPC público:** `https://api.devnet.solana.com`

El frontend queda habilitado contra el Program ID anterior cuando el `.so` y el IDL correspondientes están desplegados en Devnet.

## Ejecutar con Docker

Construye la imagen desde la raíz:

```powershell
docker build -f app/.devcontainer/Dockerfile -t registro-ventas-dev app
```

Abre la terminal aislada:

```powershell
$Root = (Get-Location).Path

docker run --rm -it `
  -v "${Root}:/workspace" `
  -v "$env:USERPROFILE\.config\solana:/home/node/.config/solana" `
  -w /workspace `
  -u node `
  registro-ventas-dev bash
```

Dentro del contenedor:

```bash
solana config set --url devnet
cd programa
anchor build
solana balance
anchor deploy --provider.cluster devnet
```

Después configura el cliente:

```bash
cd /workspace/app
npm ci
npm run configurar:idl -- ./tmp-idl/registro.json --program-id AzKi4QgysdSYuhahL2P114mRWHRDPNWJtDfhYe39ByRD
npm run cliente
npm run comprobar:idl
npm run verificar
```

Para iniciar la aplicación local desde el monorepo:

```bash
cd app
npm install
npm run dev -- --host 0.0.0.0
```

Abre `http://localhost:5173` y conecta la wallet de Devnet.

## Comprobaciones automáticas

La versión entregada debe aprobar:

```bash
npm run verificar
```

Resultado actual: 9 pruebas exitosas, tipado correcto y build Vite correcto.

## Pruebas manuales y evidencias

Usa una wallet de Devnet y no repitas la seed phrase ni una keypair privada en capturas o commits.

| Caso | Estado inicial | Operación y resultado esperado | Evidencia |
| --- | --- | --- | --- |
| Crear Registro | Wallet autorizada con SOL de Devnet | Se crea el PDA de Registro y puede consultarse | Pendiente de despliegue y firma |
| Crear Cliente Ana | Registro existente | Se crea Cliente #1 y compras comienza en 0 | Pendiente de despliegue y firma |
| Registrar CAF01 por primera vez | Cliente Ana sin ventas | Se crea Venta #1 con SKU CAF01 | Pendiente de despliegue y firma |
| Registrar CAF01 nuevamente | Venta #1 ya existente | Se crea Venta #2 con el mismo SKU | Prueba central del aporte; pendiente de despliegue y firma |
| Cambiar monto | Venta seleccionada existente | Cambia solo el monto de esa Venta | Pendiente de despliegue y firma |
| Hacer devolución | Venta seleccionada existente | Se elimina el historial, se reduce compras y se cierra la cuenta | Pendiente de despliegue y firma |

La documentación oficial exige además probar permisos, pertenencia y baja/cierre condicionado. Estos rechazos controlados deben registrarse durante las pruebas manuales:

- Wallet no autorizada.
- Venta ajena al cliente.
- Venta ajena al registro.
- Devolución repetida o cuenta inexistente.

Conserva las firmas disponibles en [Solana Explorer Devnet](https://explorer.solana.com/?cluster=devnet). Para errores en simulación previa sin firma, conserva el código o mensaje de error y verifica que las cuentas mantienen su estado.

## Estado de entrega

- Código publicado: [repositorio](https://github.com/oscaracu/registro-ventas-solana)
- Commit base actual: `9fbbb6832e099050b6a848de63d65542648142b6`
- Program ID: generado, pendiente de despliegue confirmado
- Frontend local: preparado
- Pruebas automatizadas: aprobadas
- Evidencias Devnet: pendientes de despliegue y aprobación manual de wallet

Consulta las reglas oficiales:

- [Pruebas y evidencias](https://waylearn.gitbook.io/solana-engineering-track-advanced/pruebas-y-evidencias)
- [Proyecto final y certificado](https://waylearn.gitbook.io/solana-engineering-track-advanced/proyecto-final-y-certificado)
