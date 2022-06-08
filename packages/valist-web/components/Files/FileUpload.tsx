import React from 'react';
import { FileWithPath } from 'file-selector';
import { Dropzone, DropzoneStatus } from '@mantine/dropzone';
import { Group, Text, MantineTheme, useMantineTheme } from '@mantine/core';
import { XIcon } from '@heroicons/react/outline';
import { Center } from '@mantine/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical } from 'tabler-icons-react';
import { UseListStateHandler } from '@mantine/hooks/lib/use-list-state/use-list-state';

export type FileList = {
  src: FileWithPath | string;
  type: string;
  name: string;
}

interface FileUploadProps {
  files: FileList[];
  title?: string;
  size?: number;
  fileNum?: number;
  multiple?: boolean;
  fileView: 'ordered' | 'tree' | 'none';
  setFiles: UseListStateHandler<FileList>;
}

export default function FileUpload(props: FileUploadProps) {
  const theme = useMantineTheme();

  const handleFiles = (files: File[]) => {
    if (!props.multiple) {
      files.map((file) => {
        props.setFiles.setState([{
          src: file,
          type: file.type,
          name: file.name,
        }]);
      });
    } else {
      files.map((file) => {
        const newFile = {
          src: file,
          type: file.type,
          name: file.name,
        };

        let found = false;
        props.files.map((current) => {
          if (current.name === file.name) {
            found = true;
          }
        });

        if (!found) {
          props.setFiles.append(newFile);
        }
      });
    }
  };

  const FileListView = () => {
    switch (props.fileView) {
      case "ordered":
        return (
          <OrderedList 
            files={props.files} 
            setFiles={props.setFiles} 
          />
        );
      case 'tree':
        return (
          <div></div>
        );
      default:
        return (
          <DefaultList
            files={props.files} 
            setFiles={props.setFiles} 
          />
      );
    }
  };

  return (
    <div>
      <label htmlFor="cover-photo">
        {props.title || 'Files'}
      </label>
      <div style={{ marginTop: 4 }}>
        <Dropzone multiple={props.multiple} onDrop={(files) => handleFiles(files)}>
          {(status) => dropzoneChildren(status, theme)}
        </Dropzone>
      </div>
      {FileListView()}
    </div>
  );
}

export const dropzoneChildren = (status: DropzoneStatus, theme: MantineTheme) => (
  <Group position="center" spacing="xl" style={{ minHeight: 100, pointerEvents: 'none' }}>
    <div>
      <Text size="xl" inline>
        Drag files here or click to select files.
      </Text>
    </div>
  </Group>
);

interface OrderedListProps {
  files: FileList[];
  setFiles: UseListStateHandler<FileList>;
}

const OrderedList = (props: OrderedListProps) => {
  const fields = props.files.map((file, index) => (
    <Draggable key={index} index={index} draggableId={index.toString()}>
      {(provided) => (
        <Group ref={provided.innerRef} mt="xs" {...provided.draggableProps}>
          <Center {...provided.dragHandleProps}>
            <GripVertical size={18} />
          </Center>
          <div style={{ maxWidth: 275, overflow: 'hidden' }}>{ (typeof file.src === "object") ? file.src.path : file.src }</div>
          <XIcon onClick={() => props.setFiles.remove(index)} style={{ strokeWidth: 3 }} height={30} width={30} />
        </Group>
      )}
    </Draggable>
  ));

  return (
      <DragDropContext
        onDragEnd={({ destination, source }) =>
          // @ts-ignore
          props.setFiles.reorder({ from: source.index, to: destination?.index })
        }
      >
        <Droppable droppableId="dnd-list" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
  );
};

interface DefaultListProps {
  files: FileList[];
  setFiles: UseListStateHandler<FileList>;
}

const DefaultList = (props: DefaultListProps) => {
  return (
    <ul className='pt-2'>
      {props.files && props.files.map((file, index) => (
        <li className="flex justify-between py-1 column-gap-5" key={(typeof file.src === "object") ? file.src.path : file.src}>
          <div style={{ overflow: "hidden" }}>{ (typeof file.src === "object") ? file.src.path : file.src }</div>
          <div className="flex align-middle">
            <XIcon onClick={() => props.setFiles.remove(index)} style={{ strokeWidth: 3 }} height={30} width={30} />
          </div>
        </li>
      ))}
    </ul>
  );
};
