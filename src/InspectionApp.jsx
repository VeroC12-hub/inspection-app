import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clipboard, Camera, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { SHEETS_CONFIG } from './lib/sheets';

const CONFIG = {
  COMPANY_LOGO: '/company_logo.png'
};

const InspectionApp = () => {
  const [expandedArea, setExpandedArea] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();

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
        const success = await window.submitToGoogleSheets(formattedData);
        
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArea = (area) => {
    setExpandedArea(expandedArea === area ? null : area);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="space-y-4 bg-white border-b">
          <div className="flex justify-center mb-6">
            {CONFIG.COMPANY_LOGO ? (
              <img 
                src={CONFIG.COMPANY_LOGO} 
                alt="Company Logo" 
                className="max-h-20 object-contain mb-4"
              />
            ) : (
              <div className="text-center mb-4">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No logo configured</p>
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600">CBI PATROLLERS CHECKLIST</h1>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <div>
                <Label htmlFor="operatorName" className="text-lg font-semibold text-gray-700">
                  Operator Name
                </Label>
                <Input
                  id="operatorName"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shift" className="text-sm font-medium text-gray-700">
                    Shift
                  </Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value) => setFormData(prev => ({...prev, shift: value}))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Date
                  </Label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                    Time
                  </Label>
                  <Input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(areas).map(([area, equipment]) => (
                <div key={area} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleArea(area)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                  >
                    <span className="text-lg font-semibold text-gray-800">{area}</span>
                    {expandedArea === area ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  
                  {expandedArea === area && (
                    <div className="p-4 space-y-4">
                      {Object.entries(equipment).map(([equip, items]) => (
                        <Card key={equip} className="p-4 border-l-4 border-blue-500">
                          <h3 className="font-semibold text-lg text-gray-800 mb-4">{equip}</h3>
                          <div className="space-y-4">
                            {items.map(item => {
                              const key = `${area}-${equip}-${item}`;
                              return (
                                <div key={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-lg">
                                  <Label className="text-sm font-medium text-gray-700">{item}</Label>
                                  <Select
                                    value={formData.inspectionData[key]?.status || ''}
                                    onValueChange={(value) => handleStatusChange(key, value)}
                                  >
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="OK" className="text-green-600">OK</SelectItem>
                                      <SelectItem value="NOT OK" className="text-red-600">NOT OK</SelectItem>
                                      <SelectItem value="Needs Attention" className="text-yellow-600">Needs Attention</SelectItem>
                                      <SelectItem value="Not Applicable" className="text-gray-600">Not Applicable</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Notes"
                                    value={formData.inspectionData[key]?.notes || ''}
                                    onChange={(e) => handleNotesChange(key, e.target.value)}
                                    className="bg-white"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <Label htmlFor="image-upload" className="text-lg font-semibold text-gray-700">
                Upload Images
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('image-upload').click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Add Photo</span>
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="space-y-1">
                    <img
                      src={img.data}
                      alt={`Inspection ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow-sm"
                    />
                    <p className="text-sm text-gray-500">{img.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Label htmlFor="generalNotes" className="text-lg font-semibold text-gray-700">
                General Notes
              </Label>
              <Input
                id="generalNotes"
                name="generalNotes"
                value={formData.generalNotes}
                onChange={handleChange}
                className="mt-2"
                placeholder="Add any general notes or observations"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
            >
              <Clipboard className="w- h-5 mr-2" />
              Submit Inspection
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InspectionApp;