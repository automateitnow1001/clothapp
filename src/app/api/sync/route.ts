import { NextResponse } from "next/server";
import { PominaConnector } from "@/connectors/pomina";
import { PuryConnector } from "@/connectors/pury";
import { ChetaJeansConnector } from "@/connectors/cheta-jeans";
import { ShapleJeansConnector } from "@/connectors/shaple-jeans";
import { SeisConnector } from "@/connectors/seis";
import { SyesMayoristaConnector } from "@/connectors/syes-mayorista";
import { SyesMinoristaConnector } from "@/connectors/syes-minorista";
import { IConnector } from "@/connectors/connector-base";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    if (!supplierId) {
      return NextResponse.json({ error: "supplierId is required" }, { status: 400 });
    }

    let connector: IConnector;

    switch (supplierId) {
      case "s1":
        connector = new SyesMinoristaConnector();
        break;
      case "s2":
        connector = new SeisConnector();
        break;
      case "s3":
        connector = new ShapleJeansConnector();
        break;
      case "s4":
        connector = new ChetaJeansConnector();
        break;
      case "s5":
        connector = new PuryConnector();
        break;
      case "s6":
        connector = new PominaConnector();
        break;
      case "s7":
        connector = new SyesMayoristaConnector();
        break;
      default:
        return NextResponse.json({ error: "Invalid supplierId" }, { status: 400 });
    }

    console.log(`Executing sync api for supplier ${supplierId} (limit: ${limit})`);
    const rawProducts = await connector.fetchProducts(limit);
    return NextResponse.json({ success: true, supplierId, products: rawProducts });
  } catch (error: any) {
    console.error("Error in sync API handler:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
