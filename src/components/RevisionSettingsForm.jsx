import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useStudy } from '../context/StudyContext';
import { saveRevisionSchedule } from '../services/dataService';
import Button from './ui/Button';

const schema = yup.object({
  topicId: yup.string().required('Please select a topic'),
  nextRevisionDate: yup.string().required('Date is required'),
});

export default function RevisionSettingsForm() {
  const { topics, actions } = useStudy();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { topicId: '', nextRevisionDate: '' },
  });

  const onSubmit = async (data) => {
    try {
      // Mock API Call
      await saveRevisionSchedule(data);
      
      // Update Context explicit revision date
      actions.updateTopic({ id: data.topicId, nextRevisionDate: data.nextRevisionDate });
      
      // Notify success
      toast.success(`Revision explicitly scheduled for ${data.nextRevisionDate}`);
      reset();
    } catch (err) {
      toast.error('Failed to update revision schedule');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs text-surface-400 font-medium block mb-1.5">Select Topic</label>
        <select {...register('topicId')} className="form-input w-full cursor-pointer mb-1">
          <option value="" disabled>-- Choose a Topic --</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        {errors.topicId && <p className="text-red-400 text-xs">{errors.topicId.message}</p>}
      </div>
      <div>
        <label className="text-xs text-surface-400 font-medium block mb-1.5">Revision Date</label>
        <div className="flex gap-3 relative">
          <div className="flex-1">
            <input 
              {...register('nextRevisionDate')} 
              type="date"
              className="form-input w-full"
            />
            {errors.nextRevisionDate && (
              <p className="text-red-400 text-xs mt-1 absolute -bottom-5 left-0">{errors.nextRevisionDate.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Set Date'}
          </Button>
        </div>
      </div>
    </form>
  );
}
