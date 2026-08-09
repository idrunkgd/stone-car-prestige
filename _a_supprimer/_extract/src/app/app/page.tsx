import { TopBar } from "@/components/layout/TopBar";
import { StatTile } from "@/components/ui/StatTile";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppointmentRow } from "@/components/today/AppointmentRow";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { eur, longDate, humanDuration } from "@/lib/utils";
import {
  todaysAppointments,
  todaysMetrics,
  getVehicle,
  customerName,
} from "@/lib/demo-data";

export default function TodayPage() {
  const m = todaysMetrics();
  const today = new Date();

  const inShop = todaysAppointments.filter((a) => a.status === "EN_COURS");
  const ready = todaysAppointments.filter((a) => a.status === "PRET");

  return (
    <>
      <TopBar
        greeting="Bonjour Gérald"
        title="Aujourd'hui"
        date={longDate(today)}
        cta="Réservation"
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile value={m.planned} label="Véhicules prévus" />
        <StatTile value={m.inShop} label="À l'atelier" gold />
        <StatTile value={m.ready} label="Prêts à partir" green />
        <StatTile value={m.revenueForecast} suffix=" €" label="CA prévu" gold />
        <StatTile value={m.toCollect} suffix=" €" label="À encaisser" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* Timeline du jour */}
        <section>
          <SectionHeader title="Timeline du jour" link="Voir le planning →" />
          <div className="flex flex-col gap-2.5">
            {todaysAppointments.map((a) => {
              const v = getVehicle(a.vehicleId)!;
              return (
                <AppointmentRow
                  key={a.id}
                  time={a.time}
                  title={`${v.make} ${v.model}`}
                  plate={v.plate}
                  service={a.service}
                  status={a.status}
                />
              );
            })}
          </div>
        </section>

        {/* Colonne opérationnelle */}
        <section className="space-y-5">
          <div>
            <SectionHeader title="Actuellement à l'atelier" />
            {inShop.length > 0 ? (
              inShop.map((a) => {
                const v = getVehicle(a.vehicleId)!;
                return (
                  <VehicleCard
                    key={a.id}
                    title={`${v.make} ${v.model}`}
                    plate={v.plate}
                    customer={customerName(a.customerId)}
                    service={a.service}
                    status={a.status}
                    price={a.priceEstimate}
                    subtitle={
                      a.workedMinutes
                        ? `Avancement · ${humanDuration(a.workedMinutes)}`
                        : undefined
                    }
                  />
                );
              })
            ) : (
              <Card className="text-center text-sm text-ink-muted">
                Aucun véhicule en cours pour le moment.
              </Card>
            )}
          </div>

          <div>
            <SectionHeader title="Prêts à partir · à encaisser" />
            <Card>
              {ready.length > 0 ? (
                <>
                  {ready.map((a) => {
                    const v = getVehicle(a.vehicleId)!;
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between border-b border-line-soft py-2.5 last:border-0"
                      >
                        <div>
                          <b className="text-sm">
                            {v.make} {v.model}
                          </b>
                          <div className="text-[11.5px] text-ink-muted">
                            {a.service} · {customerName(a.customerId)}
                          </div>
                        </div>
                        <span className="font-display text-base text-gold-1">
                          {eur(a.priceEstimate)}
                        </span>
                      </div>
                    );
                  })}
                  <Button variant="ghost" fullWidth className="mt-3">
                    Encaisser &amp; livrer
                  </Button>
                </>
              ) : (
                <div className="py-2 text-center text-sm text-ink-muted">
                  Rien à encaisser pour l'instant.
                </div>
              )}
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
