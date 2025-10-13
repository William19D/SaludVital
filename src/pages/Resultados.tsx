import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye } from 'lucide-react';

interface Resultado {
  id: string;
  tipo: string;
  fecha: string;
  medico: string;
  estado: 'nuevo' | 'visto';
  descripcion: string;
}

const Resultados = () => {
  // TODO: Cargar resultados desde Supabase
  const resultados: Resultado[] = [];


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Resultados Médicos</h2>
          <p className="text-muted-foreground mt-1">
            Accede y descarga tus resultados médicos
          </p>
        </div>

        <div className="grid gap-4">
          {resultados.map((resultado) => (
            <Card key={resultado.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{resultado.tipo}</CardTitle>
                      {resultado.estado === 'nuevo' && (
                        <Badge className="bg-accent">Nuevo</Badge>
                      )}
                    </div>
                    <CardDescription>{resultado.descripcion}</CardDescription>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Fecha:</span> {new Date(resultado.fecha).toLocaleDateString('es-ES')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Médico:</span> {resultado.medico}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {resultados.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No hay resultados disponibles</p>
              <p className="text-sm text-muted-foreground">
                Tus resultados médicos aparecerán aquí cuando estén disponibles
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Resultados;
