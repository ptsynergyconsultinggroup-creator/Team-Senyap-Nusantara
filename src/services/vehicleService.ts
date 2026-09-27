import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Vehicle } from '../types';

const VEHICLES_COLL = 'vehicles';

export const initialVehicles: Vehicle[] = [
  {
    id: 'P-1892-VM',
    licensePlate: 'P 1892 VM',
    memberId: '35.09-2026-0016',
    memberName: 'M. Very Ardiyansyah',
    vehicleType: 'Mobil',
    brandModel: 'Toyota Kijang Innova Reborn',
    year: '2022',
    color: 'Hitam Metalik',
    chassisNumber: 'MHKW1BA3NJJ******',
    engineNumber: '2GD-FTV******',
    stickerStatus: 'Diterbitkan & Tertempel',
    stickerNumber: 'TSN-STK-0016',
    notes: 'Kendaraan operasional anggota wilayah Jawa Timur',
    createdAt: '2026-01-15',
  },
  {
    id: 'P-4521-SN',
    licensePlate: 'P 4521 SN',
    memberId: 'TSN-00125',
    memberName: 'IBRAHIM (Bendahara)',
    vehicleType: 'Mobil',
    brandModel: 'Toyota Fortuner GR Sport',
    year: '2023',
    color: 'Putih Mutiara',
    stickerStatus: 'Diterbitkan & Tertempel',
    stickerNumber: 'TSN-STK-0001',
    notes: 'Kendaraan operasional logistik TRC Kantor Pusat Jember',
    createdAt: '2026-01-10',
  },
  {
    id: 'L-1945-TSN',
    licensePlate: 'L 1945 TSN',
    memberId: 'TSN-00101',
    memberName: 'HERI PRABOWO, S.H.',
    vehicleType: 'Mobil',
    brandModel: 'Honda CR-V Turbo',
    year: '2021',
    color: 'Abu-Abu Baja',
    stickerStatus: 'Diterbitkan & Tertempel',
    stickerNumber: 'TSN-STK-0002',
    notes: 'Unit advokasi hukum lapangan & mediasi sengketa konsumen',
    createdAt: '2026-02-01',
  }
];

/**
 * Real-time listener for Member Vehicles list
 */
export function subscribeVehicles(
  onUpdate: (vehicles: Vehicle[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const collRef = collection(db, VEHICLES_COLL);
    return onSnapshot(
      collRef,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(initialVehicles);
          return;
        }

        const list: Vehicle[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Vehicle);
        });

        // Sort by plate or creation
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        onUpdate(list);
      },
      (error) => {
        console.warn('Vehicles Firestore listener fallback:', error);
        onUpdate(initialVehicles);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe to vehicles:', error);
    onUpdate(initialVehicles);
    return () => {};
  }
}

/**
 * Save new Vehicle record
 */
export async function saveVehicle(vehicle: Vehicle): Promise<void> {
  const path = `${VEHICLES_COLL}/${vehicle.id}`;
  try {
    const docRef = doc(db, VEHICLES_COLL, vehicle.id);
    await setDoc(docRef, vehicle);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update Vehicle record
 */
export async function updateVehicle(vehicle: Vehicle): Promise<void> {
  const path = `${VEHICLES_COLL}/${vehicle.id}`;
  try {
    const docRef = doc(db, VEHICLES_COLL, vehicle.id);
    await setDoc(docRef, vehicle, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete Vehicle record
 */
export async function deleteVehicle(vehicleId: string): Promise<void> {
  const path = `${VEHICLES_COLL}/${vehicleId}`;
  try {
    const docRef = doc(db, VEHICLES_COLL, vehicleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
