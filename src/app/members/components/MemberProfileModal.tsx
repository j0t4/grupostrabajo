import { Button } from "@/components/ui/button"
import { Mail, User, Briefcase, Building, Info } from "lucide-react"

type Member = {
  id: string;
  name: string;
  surname: string;
  email: string;
  dni: string;
  position: string | null;
  organization: string | null;
  phone1: string | null;
  phone1Description: string | null;
  phone2: string | null;
  phone2Description: string | null;
  phone3: string | null;
  phone3Description: string | null;
  status: "ACTIVE" | "INACTIVE";
  deactivationDate: string | null;
  deactivationDescription: string | null;
};

type MemberProfileModalProps = {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
};

export function MemberProfileModal({ member, isOpen, onClose }: MemberProfileModalProps) {
  if (!member) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">
            {member.name} {member.surname}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{member.name} {member.surname}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{member.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Info className="w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">DNI</p>
                <p>{member.dni}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p>{member.position || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Building className="w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Organization</p>
                <p>{member.organization || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-5 mr-3 flex items-center justify-center">
                <span className="text-sm text-gray-500">1</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>
                  {member.phone1 || 'N/A'}
                  {member.phone1Description && ` (${member.phone1Description})`}
                </p>
              </div>
            </div>
          </div>
          
          {(member.phone2 || member.phone3) && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Additional Phones</h3>
              <div className="space-y-2">
                {member.phone2 && (
                  <div className="flex items-center">
                    <div className="w-8 h-5 mr-3 flex items-center justify-center">
                      <span className="text-sm text-gray-500">2</span>
                    </div>
                    <p>
                      {member.phone2}
                      {member.phone2Description && ` (${member.phone2Description})`}
                    </p>
                  </div>
                )}
                
                {member.phone3 && (
                  <div className="flex items-center">
                    <div className="w-8 h-5 mr-3 flex items-center justify-center">
                      <span className="text-sm text-gray-500">3</span>
                    </div>
                    <p>
                      {member.phone3}
                      {member.phone3Description && ` (${member.phone3Description})`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {member.status === "INACTIVE" && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Deactivation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Deactivation Date</p>
                  <p>{member.deactivationDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p>{member.deactivationDescription || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
        
      </div>
    </div>
  );
}
