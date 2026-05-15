export default function TripsPage() {
  const trips = [
    { name: "Goa long weekend", when: "this October" },
    { name: "Spiti road trip", when: "next summer" },
    { name: "Tokyo cherry blossom", when: "April 2027" },
  ];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Your trips</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Three hardcoded trips for now. Day 6 will swap this list for a real
        Prisma query against MongoDB.
      </p>
      <ul className="flex flex-col gap-3">
        {trips.map((trip) => (
          <li
            key={trip.name}
            className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
          >
            <p className="font-medium">{trip.name}</p>
            <p className="text-xs text-neutral-500">{trip.when}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
