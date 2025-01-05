// src/lib/sheets.js
export const SHEETS_CONFIG = {
  SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID'
};

// src/components/ui/toast.jsx (you'll need to create this)
import { useToast as useToastOriginal } from "@/components/ui/use-toast"

export const useToast = () => {
  return useToastOriginal();
};

// src/InspectionApp.jsx (complete updated file)
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Clipboard, Camera, ChevronDown, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { SHEETS_CONFIG } from './lib/sheets';

const InspectionApp = () => {
  const areas = {
    'Area 511 - Raw Material to Silos': {
      'TRAFIC LIGHT': ['CLINKER 1', 'CLINKER 2', 'GYPSUM', 'LIMESTONE'],
      'SAMSON': ['Belt_BC03', 'Motor/Gearbox', 'Filter_BF04', 'Discharge Outlet', 'Hopper_HP01', 'Graitings'],
      'INCLINED CONVEYOR': ['Belt_BC02', 'Chain_BZ02', 'Motor/Gearbox', 'Filter_BF03'],
      'TWO-WAY CONVEYOR_BC01': ['Belt_BC01', 'Chain_BZ01', 'Motor/Gearbox'],
      'BUCKET ELEVATOR_BE01': ['motor/gearbox'],
      'SILOS': ['LEVEL SENSORS', 'LEAKAGES', 'FILTERS_BF01 & BF02']
    },  
    'Area 531 - Feeder Mill': {
      'CLINKER 1 FEEDER_WF01': ['Belt', 'Hopper', 'Motor'],
      'CLINKER 2 FEEDER_WF02': ['Belt', 'Hopper', 'Motor'],
      'GYPSUM FEEDER_WF03': ['Belt', 'Hopper', 'Motor'],
      'LIMESTONE FEEDER_WF04': ['Belt', 'Hopper', 'Motor'],
      'FEEDER BELT': ['Belt_BC03', 'Chain_BZO3', 'Motor/Gearbox'],  
      'MAGNETIC SEPARATOR_MS01': ['Status'],
      'GREEN BELT': ['Belt_BC02', 'Chain_BZ02', 'Motor/Gearbox'],
      'SULPHATE FILTER': ['Screw Conveyor_SC02', 'Purging', 'Motor/Gearbox_FN02.M1',],
      'LONG BELT': ['Belt_BC01', 'Chain_BZ01', 'Motor/Gearbox']
    },
    'Area  561 - Mill': {
      'CHILLER': ['Temperature', 'Vent'],
      'MILL': [
        'AUXILIARY MOTOR_1x01.M2',
        'MILL MOTOR_1x01.M1',
        'GEARBOX_GB01',
        'RHEOSTAT_1R01',
        'INLET TRUNION LEAKAGE',
        'MILL OUTLET LEAKAGE'
      ],
      'MILL LUBRICATION': ['LQ01', 'LQ02', 'LQ03', 'LQ04'],  
      'ADDITIVE SYSTEM': ['Pump', 'Flow'],
      'BURNER_BU01': ['Status'],
      'WATER INJECTION SYSTEM': ['Status'],
      'BUCKET ELEVATOR_BE01': ['Motor/Gearbox'],
      'AIRSLIDE COVEYORS': ['Status', 'Blowers'],
      'BV06 & BV07': ['Status', 'Flap', 'Rotary screen_RS01'],
      'AIR COMPRESSORS': ['Status', 'Drier'],
      'SEPARATOR': [
        'MOTOR/GEARBOX',
        'SEPERATOR FAN_FA01',
        'BV08',
        'LUBRICATION UNIT',
        'FLAPS',
        'CYCLONES',
        'SHENCK'
      ],
      'BIG BAG FILTER_BF03': ['Purging', 'Motor/Gearbox_FN03.M1', 'Screw Conveyor_SC02', 'Rotary Feeder_RF02', 'Divertor Gate_DG01'],
      'ELEVATOR FILTER_BF01': ['Rotary Feeder_RF01', 'Purging', 'Motor/Gearbox_FN01.M1',],
      'SEPARATOR FILTER': ['Rotary Feeder_591 RF01', 'Purging', 'Motor/Gearbox_FN02.M1',]
    },
    'Area 591 - Cement Silos': {
      'AIRSLIDES CONVEYORS': ['Status', 'BLowers'],
      'DIVERTOR GATES': ['DG01', 'DG02', 'DG03', 'DG04'],
      'SILO 1_3S01': ['Filter', 'Level Sensors', 'Status'],
      'SILO 2_3S02': ['Filter', 'Level Sensors', 'Status'],
      'SILO 3_3S03': ['Filter', 'Level Sensors', 'Status'],
      'SILO 4_3S04': ['Filter', 'Level Sensors', 'Status'],
      'PURGE SIlo_3S05': ['Filter', 'Level Sensors', 'Status'],
      'ELEVATOR_BE01': ['mMotor/Gearbox'],
      'SILO FLUIDIZATION': ['Lump Crushers', 'Butterfly Valves']
    }
  };

  const [expandedArea, setExpandedArea] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    operatorName: '',
    shift: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    inspectionData: Object.fromEntries(
      Object.entries(areas).flatMap(([area, equipment]) =>
        Object.entries(equipment).flatMap(([equip, items]) =>
          items.map(item => [`${area}-${equip}-${item}`, {
            status: '',
            notes: ''
          }])
        )
      )
    ),
    images: [],
    generalNotes: ''
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncPendingData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load saved form data if any
    const savedData = localStorage.getItem('currentInspection');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save form data when it changes
  useEffect(() => {
    localStorage.setItem('currentInspection', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      inspectionData: {
        ...prev.inspectionData,
        [key]: {
          ...prev.inspectionData[key],
          status: value
        }
      }
    }));
  };

  const handleNotesChange = (key, notes) => {
    setFormData(prev => ({
      ...prev,
      inspectionData: {
        ...prev.inspectionData,
        [key]: {
          ...prev.inspectionData[key],
          notes: notes
        }
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            data: reader.result,
            timestamp: new Date().toLocaleTimeString(),
            name: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDataForSheets = () => {
    const timestamp = new Date().toISOString();
    const inspectionEntries = Object.entries(formData.inspectionData).map(([key, data]) => {
      const [area, equipment, item] = key.split('-');
      return {
        timestamp,
        operatorName: formData.operatorName,
        shift: formData.shift,
        date: formData.date,
        time: formData.time,
        area,
        equipment,
        item,
        status: data.status,
        notes: data.notes,
        imageUrls: formData.images.map(img => img.data).join(', '),
        generalNotes: formData.generalNotes
      };
    });

    return inspectionEntries;
  };

  const submitToGoogleSheets = async (data) => {
    try {
      const response = await fetch(SHEETS_CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'appendInspectionData',
          spreadsheetId: SHEETS_CONFIG.SPREADSHEET_ID,
          data: data
        })
      });

      if (!response.ok) throw new Error('Failed to submit to Google Sheets');
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      throw error;
    }
  };

  const syncPendingData = async () => {
    const pendingData = JSON.parse(localStorage.getItem('pendingInspections') || '[]');
    if (pendingData.length === 0) return;

    for (const data of pendingData) {
      try {
        const success = await submitToGoogleSheets(data);
        if (success) {
          const remaining = pendingData.filter(item => item !== data);
          localStorage.setItem('pendingInspections', JSON.stringify(remaining));
          
          toast({
            title: "Sync Complete",
            description: "Offline data has been synchronized",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error syncing pending data:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedData = formatDataForSheets();

      if (isOffline) {
        const pendingData = JSON.parse(localStorage.getItem('pendingInspections') || '[]');
        pendingData.push(formattedData);
        localStorage.setItem('pendingInspections', JSON.stringify(pendingData));
        
        toast({
          title: "Saved Offline",
          description: "Inspection saved and will sync when online",
          duration: 3000,
        });
      } else {
        const success = await submitToGoogleSheets(formattedData);
        
        if (success) {
          toast({
            title: "Success",
            description: "Inspection data submitted successfully",
            duration: 3000,
          });
          
          // Reset form
          setFormData({
            operatorName: '',
            shift: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            inspectionData: {},
            images: [],
            generalNotes: ''
          });
          
          localStorage.removeItem('currentInspection');
        }
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
      toast({
        title: "Error",
        description: "Failed to submit inspection. Data saved offline.",
        variant: "destructive",
        duration: 5000,
      });
      
      const pendingData = JSON.parse(localStorage.getItem('pendingInspections') || '[]');
      pendingData.push(formattedData);
      localStorage.setItem('pendingInspections', JSON.stringify(pendingData));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArea = (area) => {
    setExpandedArea(expandedArea === area ? null : area);
  };

  // The JSX render part remains exactly the same as your original code
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Your existing JSX code remains unchanged */}
    </div>
  );
};

export default InspectionApp;