export default function MatrixTable({ postcodes, durations, distances }) {
  if (!durations || !distances) return null;

  return (
    <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>From \ To</th>
          {postcodes.map((pc, i) => (
            <th key={i}>{pc.Postcode}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {postcodes.map((fromPc, i) => (
          <tr key={i}>
            <td>
              <strong>{fromPc.Postcode}</strong>
            </td>
            {postcodes.map((_, j) => (
              <td key={j}>
                {(durations[i][j] / 60).toFixed(2)} min /{" "}
                {distances[i][j].toFixed(0)} m
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
