import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  SERVICE_CATALOG as LOCAL_CATALOG,
  type ServiceCategory,
} from "@/data/serviceCatalog";

interface CatalogResponse {
  categories: ServiceCategory[];
}

/**
 * Returns the canonical service catalog, with the local-bundled copy
 * as the initial value (instant render) and the server response
 * overlaying it once it lands. This way the picker is never empty
 * AND we can add catalog entries server-side without a frontend
 * release.
 */
export const useServiceCatalog = () =>
  useQuery<ServiceCategory[]>({
    queryKey: ["serviceCatalog"],
    queryFn: async () => {
      const { data } = await api.get<CatalogResponse>("/services");
      return data.categories ?? LOCAL_CATALOG;
    },
    initialData: LOCAL_CATALOG,
    staleTime: 30 * 60_000,
  });
