export default function EmployeesPage() {
  const employees = [
    { id: 1, name: 'Animesh Mohapatra', role: 'Frontend Developer' },
    { id: 2, name: 'Anyusha Panda', role: 'HR Manager' },
    { id: 3, name: 'Ravi Kumar', role: 'Backend Engineer' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Employees</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Employee</button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.role}</td>
                <td className="p-3">
                  <button className="text-sm text-blue-600">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
