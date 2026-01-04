
import React, { useState } from 'react';
import { Table } from '../types';

interface SchemaCardProps {
  table: Table;
}

const SchemaCard: React.FC<SchemaCardProps> = ({ table }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFields = table.fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0d1310] rounded-2xl shadow-xl border border-white/5 overflow-hidden group hover:border-emerald-500/20 transition-all">
      <div className="bg-[#0a0f0d] p-5 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{table.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{table.description}</p>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder={`Filter fields...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full sm:w-48 pl-4 pr-3 py-1.5 border border-white/5 bg-[#050807] text-slate-300 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080c0a] text-slate-600 border-b border-white/5 uppercase tracking-tighter font-bold">
            <tr>
              <th className="px-5 py-3">Field</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Constraints</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFields.map((field) => (
              <tr key={field.name} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-300">
                  <span className={searchTerm && field.name.toLowerCase().includes(searchTerm.toLowerCase()) ? "bg-emerald-500/20 text-emerald-400 px-1 rounded" : ""}>
                    {field.name}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-emerald-500/70">
                    {field.type}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {field.constraints.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchemaCard;
