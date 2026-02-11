export interface Employee {
  id: string;
  name: string;
  role: string;
}

let employeesList: Employee[] = [
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    role: 'Sr. Enterprise Digital Strategy Manager',
  },
  {
    id: 'john-chen',
    name: 'John Chen',
    role: 'Senior Software Engineer',
  },
  {
    id: 'sarah-williams',
    name: 'Sarah Williams',
    role: 'Product Manager',
  },
];

// Getter function to always return current employees
export function getEmployees(): Employee[] {
  return employeesList;
}

export const employees = employeesList;

export function getEmployeeById(id: string): Employee | undefined {
  return employeesList.find(emp => emp.id === id);
}

export function addEmployee(name: string, role: string = 'New Hire'): Employee {
  // Generate ID from name (lowercase, replace spaces with hyphens)
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  // Check if employee already exists
  const existingEmployee = getEmployeeById(id);
  if (existingEmployee) {
    return existingEmployee;
  }
  
  const newEmployee: Employee = {
    id,
    name,
    role,
  };
  
  employeesList.push(newEmployee);
  console.log('Employee added to list:', newEmployee);
  console.log('Total employees:', employeesList.length);
  return newEmployee;
}