export default function MaintenancePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "30px",
      }}
    >
      <div>
        <h1>Site temporairement en maintenance</h1>

        <p>
          Nous effectuons actuellement une mise à jour.
          Merci de revenir dans quelques instants.
        </p>
      </div>
    </main>
  );
}